import pkg from "pg";
const { Pool } = pkg;

// Local DBeaver/Postgres DB
export const localPool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "inventorydb",
  password: "Pr@xchee2007", // your password
  port: 5432,
});
