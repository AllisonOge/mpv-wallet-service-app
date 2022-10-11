/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex("users").del();
  await knex("users").insert([
    {username: "ohgay", email: "ohgay@justohgay.com", balance: 300000.23},
    {username: "john", email: "john@justohgay.com", balance: 23500.34},
  ])
};
