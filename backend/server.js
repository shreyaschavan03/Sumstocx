import express from "express";
import cors from "cors";
import db from "./db.js";

const { localPool, supabasePool } = db;

const app = express();
app.use(cors());
app.use(express.json());

// Helper to run query on both DBs
async function runOnBoth(query, values = []) {
  try {
    const localRes = await localPool.query(query, values);
    console.log("✅ Local DB affected rows:", localRes.rowCount);
  } catch (err) {
    console.error("❌ Local DB error:", err.message);
  }

  try {
    const remoteRes = await supabasePool.query(query, values);
    console.log("✅ Supabase DB affected rows:", remoteRes.rowCount);
  } catch (err) {
    console.error("❌ Supabase DB error:", err.message);
  }
}

// ✅ Update stock by ID (frontend compatible)
app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  try {
    await runOnBoth(
      `UPDATE products SET stock = $1 WHERE id = $2`,
      [stock, id]
    );

    res.json({ message: "Stock updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update stock" });
  }
});

// ✅ Save user settings
app.post("/user/settings", async (req, res) => {
  const { username, email, theme } = req.body;

  try {
    await runOnBoth(
      `INSERT INTO users (username, email, theme)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET username = EXCLUDED.username, theme = EXCLUDED.theme`,
      [username, email, theme]
    );

    res.json({ message: "Settings saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save settings" });
  }
});

// ✅ Add new product
app.post("/products", async (req, res) => {
  const { name, barcode, price, stock } = req.body;

  try {
    await runOnBoth(
      "INSERT INTO products (name, barcode, price, stock) VALUES ($1, $2, $3, $4)",
      [name, barcode, price, stock]
    );

    res.json({ message: "Product added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add product" });
  }
});

// ✅ Get products (local only)
app.get("/products", async (req, res) => {
  try {
    const result = await localPool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
