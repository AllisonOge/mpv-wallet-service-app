const chai = require("chai");
const should = chai.should();
const app = require("../app");
const database = require("../knex/database");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);

describe("Accounts", () => {
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

  describe("POST accounts", () => {
    it("it should fail because there is no authorization token", async () => {
      const accDetails = { amount: 1000 };
      const openAccRes = await chai
        .request(app)
        .post("/api/v1/accounts")
        .send(accDetails);

      openAccRes.should.have.status(401);
      openAccRes.body.should.be.a("object");
      openAccRes.body.should.have
        .property("details")
        .equal("Access Denied / Unauthorized request");
    });

    it("it should open a new account", async () => {
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
      const token = loginRes.body.token;

      const openAccRes = await chai
        .request(app)
        .post("/api/v1/accounts")
        .set("authorization", `Bearer ${token}`)
        .send({ amount: 1000 });

      openAccRes.should.have.status(201);
      openAccRes.body.should.have
        .property("message")
        .equal("Account successfully created");
    });

    it("it should fail because account already exist", async () => {
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
      const token = loginRes.body.token;

      const openAccRes = await chai
        .request(app)
        .post("/api/v1/accounts")
        .set("authorization", `Bearer ${token}`)
        .send({ amount: 1000 });

      openAccRes.should.have.status(201);

      const openAgainRes = await chai
        .request(app)
        .post("/api/v1/accounts")
        .set("authorization", `Bearer ${token}`)
        .send({ amount: 1000 });

      openAgainRes.should.have.status(409);
      openAgainRes.body.should.have
        .property("details")
        .equal("Duplicate entry: account already created");
    });
  });

  describe("GET accounts", () => {
    it("it should fail because there is no authorization token", async () => {
      const openAccRes = await chai.request(app).get("/api/v1/accounts");

      openAccRes.should.have.status(401);
      openAccRes.body.should.be.a("object");
      openAccRes.body.should.have
        .property("details")
        .equal("Access Denied / Unauthorized request");
    });

    it("it should fail because user has no account", async () => {
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
      const token = loginRes.body.token;

      const getAccRes = await chai
        .request(app)
        .get("/api/v1/accounts")
        .set("authorization", `Bearer ${token}`);

      getAccRes.should.have.status(404);
      getAccRes.body.should.have
        .property("details")
        .equal(`User 1 does not have an account`);
    });

    it("it should get account of the logged in user", async () => {
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
      const token = loginRes.body.token;

      const accDetails = { amount: 1000 };
      const openAccRes = await chai
        .request(app)
        .post("/api/v1/accounts")
        .set("authorization", `Bearer ${token}`)
        .send(accDetails);

      openAccRes.should.have.status(201);

      const getAccRes = await chai
        .request(app)
        .get("/api/v1/accounts")
        .set("authorization", `Bearer ${token}`);

      getAccRes.should.have.status(200);
      getAccRes.body.should.have.property("id");
      getAccRes.body.should.have.property("balance").equal(accDetails.amount);
      getAccRes.body.should.have.property("user_id");
      getAccRes.body.should.have.property("created_at");
    });
  });
});
