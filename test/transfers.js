const chai = require("chai");
const should = chai.should();
const app = require("../app");
const database = require("../knex/database");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);

describe("Transfers", () => {
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

  describe("POST transfers", () => {
    it("it should fail because there is no authorization token", async () => {
      const openAccRes = await chai
        .request(app)
        .post("/api/v1/transfers")
        .send({ amount: 1000, beneficiary: 1 });

      openAccRes.should.have.status(401);
      openAccRes.body.should.be.a("object");
      openAccRes.body.should.have
        .property("details")
        .equal("Access Denied / Unauthorized request");
    });

    it("it should transfer an amount from one user to another", async () => {
      // user details
      const ohgay = {
        username: "ohgay@justohgay.com",
        password: "paSSword_123",
      };

      //   create an account
      let createAccRes = await chai
        .request(app)
        .post("/api/v1/users")
        .send(ohgay);

      createAccRes.should.have.status(201);

      let loginRes = await chai.request(app).post("/api/v1/login").send(ohgay);

      loginRes.should.have.status(200);
      let token = loginRes.body.token;

      let openAccRes = await chai
        .request(app)
        .post("/api/v1/accounts")
        .set("authorization", `Bearer ${token}`)
        .send({ amount: 0 });

      openAccRes.should.have.status(201);

      //   create a second user
      const john = {
        username: "john@justohgay.com",
        password: "paSSword_123",
      };

      //   create an account for second user
      createAccRes = await chai.request(app).post("/api/v1/users").send(john);

      createAccRes.should.have.status(201);

      loginRes = await chai.request(app).post("/api/v1/login").send(john);

      loginRes.should.have.status(200);
      token = loginRes.body.token;

      openAccRes = await chai
        .request(app)
        .post("/api/v1/accounts")
        .set("authorization", `Bearer ${token}`)
        .send({ amount: 1000 });

      openAccRes.should.have.status(201);

      const transferRes = await chai
        .request(app)
        .post("/api/v1/transfers")
        .set("authorization", `Bearer ${token}`)
        .send({ amount: 1000, beneficiary: 1 });

      transferRes.should.have.status(201);
      transferRes.body.should.have
        .property("message")
        .equal("Transfer successful");
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
      const transAcc = { amount: 1000, beneficiary: 2 };

      const transferRes = await chai
        .request(app)
        .post("/api/v1/transfers")
        .set("authorization", `Bearer ${token}`)
        .send(transAcc);

      transferRes.should.have.status(404);
      transferRes.body.should.have
        .property("details")
        .equal("User 1 does not have an account");
    });

    it("it should fail because balance is insufficient", async () => {
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
      const transAcc = { amount: 1000, beneficiary: 2 };

      const transferRes = await chai
        .request(app)
        .post("/api/v1/transfers")
        .set("authorization", `Bearer ${token}`)
        .send(transAcc);

      transferRes.should.have.status(409);
      transferRes.body.should.have
        .property("details")
        .equal("Insufficient balance");
    });

    it("it should fail because beneficiary does not exist", async () => {
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
      const transAcc = { amount: 1000, beneficiary: 2 };

      const transferRes = await chai
        .request(app)
        .post("/api/v1/transfers")
        .set("authorization", `Bearer ${token}`)
        .send(transAcc);

      transferRes.should.have.status(404);
      transferRes.body.should.have
        .property("details")
        .equal(`Account ${transAcc.beneficiary} not found`);
    });

    it("it should fail because beneficiary is user's acconut", async () => {
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
      const transAcc = { amount: 1000, beneficiary: 1 };

      const transferRes = await chai
        .request(app)
        .post("/api/v1/transfers")
        .set("authorization", `Bearer ${token}`)
        .send(transAcc);

      transferRes.should.have.status(403);
      transferRes.body.should.have
        .property("details")
        .equal("Restricted request: cannot transfer to self");
    });
  });
});
