import pkg from "pg";
const { Pool } = pkg;

export const localPool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "inventorydb",
  password: "Secure@123",
  port: 5432,
});

export const supabasePool = new Pool({
  connectionString:
    "postgresql://postgres:Secure@123@db.gpfesrlqguapdnvgpjrv.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

export default { localPool, supabasePool };
