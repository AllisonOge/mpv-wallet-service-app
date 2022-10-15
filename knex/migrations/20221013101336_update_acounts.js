/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("accounts", (table) => {
    table.unique(["user_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("accounts", (table) => {
    table.dropForeign("user_id");
    table.dropUnique(["user_id"]);
    table.foreign("user_id").references("id").inTable("users");
  });
};
