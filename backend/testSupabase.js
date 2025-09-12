import pkg from "pg";
const { Pool } = pkg;

const supabasePool = new Pool({
  connectionString:
    "postgresql://postgres:Secure@123@db.gpfesrlqguapdnvgpjrv.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

const test = async () => {
  try {
    const res = await supabasePool.query("SELECT NOW()");
    console.log("✅ Supabase connected:", res.rows);
  } catch (err) {
    console.error("❌ Supabase error:", err.message);
  } finally {
    await supabasePool.end();
  }
};

test();
