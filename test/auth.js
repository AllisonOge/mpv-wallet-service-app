const chai = require("chai");
const should = chai.should();
const database = require("../knex/database");
const chaiHttp = require("chai-http");
const app = require("../app");

chai.use(chaiHttp);

describe("Authentication", () => {
  beforeEach((done) => {
    // clear the database
    // rollback and
    // update migrations
    database
      .delete()
      .from("transactions")
      .then((_) => database.delete().from("accounts"))
      .then((_) => database.delete().from("users"))
      .then((_) => database.migrate.rollback([], [true]))
      .then((_) => database.migrate.latest())
      .then((_) => {
        console.log("DONE");
        done();
      });
  });

  describe("POST login", () => {
    it("it should log in a user", async () => {
      // user details
      const user = {
        username: "ohgay@justohgay.com",
        password: "paSSword_123",
      };

      //   create an account
      const createAccRes = await chai
        .request(app)
        .post("/api/v1/users")
        .send(user);

      createAccRes.should.have.status(201);

      const loginRes = await chai.request(app).post("/api/v1/login").send(user);

      loginRes.should.have.status(200);
      loginRes.body.should.be.a("object");
      loginRes.body.should.have.property("token");
      loginRes.body.should.have.property("token_type").equal("Bearer");
    });

    it("it should fail because user provides invalid password", async () => {
      // user details
      const user = {
        username: "ohgay@justohgay.com",
        password: "paSSword_123",
      };

      //   create an account
      const createAccRes = await chai
        .request(app)
        .post("/api/v1/users")
        .send(user);

      createAccRes.should.have.status(201);

      //   provide wrong password
      user.password = "";

      const loginRes = await chai.request(app).post("/api/v1/login").send(user);

      loginRes.should.have.status(401);
      loginRes.body.should.be.a("object");
      loginRes.body.should.have
        .property("details")
        .equal("User's credentials could not be verified");
    });

    it("it should fail because user is not registered", (done) => {
      // user details
      const user = {
        username: "ohgay@justohgay.com",
        password: "paSSword_123",
      };

      chai
        .request(app)
        .post("/api/v1/login")
        .send(user)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a("object");
          res.body.should.have
            .property("details")
            .equal(`User ${user.username} not found`);

          done();
        });
    });
  });

  describe("Access Token", () => {
    it("it should fail because token is null", (done) => {
      chai
        .request(app)
        .get("/api/v1/transactions")
        .set("authorization", "Bearer ")
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property("details").equal("Invalid token");
          done();
        });
    });

    it("it should succeed with valid token", async () => {
      // user details
      const user = {
        username: "ohgay@justohgay.com",
        password: "paSSword_123",
      };

      //   create an account
      const createAccRes = await chai
        .request(app)
        .post("/api/v1/users")
        .send(user);

      createAccRes.should.have.status(201);

      const loginRes = await chai.request(app).post("/api/v1/login").send(user);

      loginRes.should.have.status(200);
      loginRes.body.should.have.property("token");

      const token = loginRes.body.token;

      const transRes = await chai
        .request(app)
        .get("/api/v1/transactions")
        .set("authorization", `Bearer ${token}`);

      transRes.should.have.status(404);
    });

    it("it should fail because token is invalid", (done) => {
      chai
        .request(app)
        .get("/api/v1/transactions")
        .set("authorization", "Bearer jabijnbgoangona")
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.have
            .property("details")
            .equal("User's credentials could not be verified");
          done();
        });
    });
  });
});
