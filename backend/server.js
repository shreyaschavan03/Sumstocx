import express from "express";
import pkg from "pg";
import cors from "cors";

const { Pool } = pkg;
const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "inventorydb",
  password: "yourpassword",
  port: 5432,
});

// Routes
app.get("/api/products", async (req, res) => {
  const result = await pool.query("SELECT * FROM products ORDER BY id DESC");
  res.json(result.rows);
});

app.post("/api/products", async (req, res) => {
  const { name, barcode, price, stock } = req.body;
  const result = await pool.query(
    "INSERT INTO products(name, barcode, price, stock) VALUES($1,$2,$3,$4) RETURNING *",
    [name, barcode, price, stock]
  );
  res.json(result.rows[0]);
});

app.put("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, barcode, price, stock } = req.body;
  const result = await pool.query(
    "UPDATE products SET name=$1, barcode=$2, price=$3, stock=$4 WHERE id=$5 RETURNING *",
    [name, barcode, price, stock, id]
  );
  res.json(result.rows[0]);
});

app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM products WHERE id=$1", [id]);
  res.json({ success: true });
});

app.listen(5000, () => console.log("Backend running on http://localhost:5000"));
