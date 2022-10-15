/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("transactions", (table) => {
    table.dropForeign("user_id");
    table.renameColumn("user_id", "account_id");
    table.foreign("account_id").references("id").inTable("accounts");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("transactions", (table) => {
    table.dropForeign("account_id");
    table.renameColumn("account_id", "user_id");
    table.foreign("user_id").references("id").inTable("users");
  });
};
