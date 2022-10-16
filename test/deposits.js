const chai = require("chai");
const should = chai.should();
const app = require("../app");
const database = require("../knex/database");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);

describe("Deposits", () => {
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

  describe("POST deposits", () => {
    it("it should fail because there is no authorization token", async () => {
      const accDetails = { amount: 1000 };
      const openAccRes = await chai
        .request(app)
        .post("/api/v1/deposits")
        .send(accDetails);

      openAccRes.should.have.status(401);
      openAccRes.body.should.be.a("object");
      openAccRes.body.should.have
        .property("details")
        .equal("Access Denied / Unauthorized request");
    });

    it("it should deposit an amount in a user's account", async () => {
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
        .send({ amount: 0 });

      openAccRes.should.have.status(201);

      const depositRes = await chai
        .request(app)
        .post("/api/v1/deposits")
        .set("authorization", `Bearer ${token}`)
        .send({ amount: 12000 });

      depositRes.should.have.status(201);
      depositRes.body.should.have
        .property("message")
        .equal("Deposit successful");
    });

    it("it should fail because amount is no more than 0", async () => {
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
        .send({ amount: 0 });

      openAccRes.should.have.status(201);

      const depositRes = await chai
        .request(app)
        .post("/api/v1/deposits")
        .set("authorization", `Bearer ${token}`)
        .send({ amount: 0 });

      depositRes.should.have.status(403);
      depositRes.body.should.have
        .property("details")
        .equal("Amount is invalid: enter a value greater than 0");
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


      const depositRes = await chai
        .request(app)
        .post("/api/v1/deposits")
        .set("authorization", `Bearer ${token}`)
        .send({ amount: 1000 });

      depositRes.should.have.status(404);
      depositRes.body.should.have
        .property("details")
        .equal("User 1 does not have an account");
    });
  });
});
