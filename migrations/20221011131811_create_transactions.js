/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("transactions", (table) => {
    table.increments();
    table
      .string("action")
      .notNullable()
      .checkIn(["withdraw", "deposit", "transfer"]);
    table.float("amount").unsigned().notNullable();
    table.timestamp("created_at", { precision: 6 }).defaultTo(knex.fn.now(6));
    table.integer("beneficiary").unsigned().notNullable();
    table.integer("user_id").unsigned().notNullable();
    table
      .foreign("beneficiary")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("transactions");
};
