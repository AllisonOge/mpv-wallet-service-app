const chai = require("chai");
const should = chai.should();
const app = require("../app");
const database = require("../knex/database");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);

describe("Transactions", () => {
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

  describe("GET transactions", async () => {
    it("it should fail because there is no authorization token", async () => {
      const openAccRes = await chai.request(app).get("/api/v1/transactions");

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

      const loginRes = await chai
        .request(app)
        .post("/api/v1/login")
        .send(user);

      loginRes.should.have.status(200);
      const token = loginRes.body.token;

      const transRes = await chai
        .request(app)
        .get("/api/v1/transactions")
        .set("authorization", `Bearer ${token}`);

      transRes.should.have.status(404);
      transRes.body.should.have
        .property("details")
        .equal("User 1 does not have an account");
    });

    it("it should validate the balance of users account", async () => {
      // user ohgay carries the following trasactions
      // opens account - 2000
      // deposits - 50000
      // transfers - 23500
      // transfers 2000
      // withdraws - 10000
      const ohgaysTrans = [2000, 50000, -23500, -2000, -10000];
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
        .send({ amount: 2000 });

      openAccRes.should.have.status(201);

      const despositRes = await chai
        .request(app)
        .post("/api/v1/deposits")
        .set("authorization", `Bearer ${token}`)
        .send({ amount: 50000 });

      despositRes.should.have.status(201);

      // user john carries the following transactions
      // opens account - 0
      // transfers - 23500
      // transfers - 2000
      // withdraws - 20000
      const johnTrans = [23500, -20000, 2000];
      // user details
      const john = {
        username: "john@justohgay.com",
        password: "paSSword_123",
      };

      // create account
      createAccRes = await chai.request(app).post("/api/v1/users").send(john);

      createAccRes.should.have.status(201);

      loginRes = await chai.request(app).post("/api/v1/login").send(john);

      loginRes.should.have.status(200);
      token = loginRes.body.token;

      openAccRes = await chai
        .request(app)
        .post("/api/v1/accounts")
        .set("authorization", `Bearer ${token}`)
        .send({ amount: 0 });

      openAccRes.should.have.status(201);

      // ohgay transfers

      loginRes = await chai.request(app).post("/api/v1/login").send(ohgay);

      loginRes.should.have.status(200);
      token = loginRes.body.token;

      let transferRes = await chai
        .request(app)
        .post("/api/v1/transfers")
        .set("authorization", `Bearer ${token}`)
        .send({ amount: 23500, beneficiary: 2 });

      transferRes.should.have.status(201);

      transferRes = await chai
        .request(app)
        .post("/api/v1/transfers")
        .set("authorization", `Bearer ${token}`)
        .send({ amount: 2000, beneficiary: 2 });

      transferRes.should.have.status(201);

      // ohgay withdraws
      let withdrawRes = await chai
        .request(app)
        .post("/api/v1/withdrawals")
        .set("authorization", `Bearer ${token}`)
        .send({ amount: 10000 });

      withdrawRes.should.have.status(201);

      let transRes = await chai
        .request(app)
        .get("/api/v1/transactions")
        .set("authorization", `Bearer ${token}`);

      transRes.should.have.status(200);
      transRes.body.should.be.a("array");
      transRes.body.length.should.be.equal(ohgaysTrans.length);

      let getAccRes = await chai
        .request(app)
        .get("/api/v1/accounts")
        .set("authorization", `Bearer ${token}`);

      getAccRes.should.have.status(200);
      getAccRes.body.should.have
        .property("balance")
        .equal(ohgaysTrans.reduce((a, b) => a + b, 0));

      // john withdraws
      loginRes = await chai.request(app).post("/api/v1/login").send(john);

      loginRes.should.have.status(200);
      token = loginRes.body.token;

      withdrawRes = await chai
        .request(app)
        .post("/api/v1/withdrawals")
        .set("authorization", `Bearer ${token}`)
        .send({ amount: 20000 });

      withdrawRes.should.have.status(201);

      transRes = await chai
        .request(app)
        .get("/api/v1/transactions")
        .set("authorization", `Bearer ${token}`);

      transRes.should.have.status(200);
      transRes.body.should.be.a("array");
      transRes.body.length.should.be.equal(johnTrans.length);

      getAccRes = await chai
        .request(app)
        .get("/api/v1/accounts")
        .set("authorization", `Bearer ${token}`);

      getAccRes.should.have.status(200);
      getAccRes.body.should.have
        .property("balance")
        .equal(johnTrans.reduce((a, b) => a + b, 0));
    });
  });
});
