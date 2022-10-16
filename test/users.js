const chai = require("chai");
const chaiHttp = require("chai-http");
const database = require("../knex/database");
const should = chai.should();

const app = require("../app");

chai.use(chaiHttp);

describe("Users", () => {
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

  describe("POST users", () => {
    // create a new user
    it("It should create a new user", (done) => {
      const newUser = {
        username: "ohgay@justohgay.com",
        password: "paSSword_123",
      };

      chai
        .request(app)
        .post("/api/v1/users")
        .send(newUser)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a("object");
          res.body.should.have.property("id");
          res.body.should.have.property("username");
          done();
        });
    });

    // raise an exception
    it("It should fail because the username already exist", (done) => {
      const newUser = {
        username: "ohgay@justohgay.com",
        password: "paSSword_123",
      };

      chai.request(app).post("/api/v1/users").send(newUser).end();

      chai
        .request(app)
        .post("/api/v1/users")
        .send(newUser)
        .end((err, res) => {
          res.should.have.status(409);
          res.body.should.be.a("object");
          res.body.should.have
            .property("details")
            .equal(`Duplicate entry: ${newUser.username} already exist`);

          done();
        });
    });
  });
});
