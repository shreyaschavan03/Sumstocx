import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "inventorydb",
  password: "Secure@123",  // change this
  port: 5432,
});
export default pool;  // ✅ THIS is the important part
