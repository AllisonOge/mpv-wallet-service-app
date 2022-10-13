/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("transactions", (table) => {
    table.dropForeign("beneficiary");
    table
      .foreign("beneficiary")
      .references("id")
      .inTable("accounts")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("transactions", (table) => {
    table.dropForeign("beneficiary");
    table
      .foreign("beneficiary")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
  });
};
