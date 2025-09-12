import express from "express";
import cors from "cors";
import { localPool } from "./db.js"; // named import only

const app = express();
app.use(cors());
app.use(express.json());

// Helper to run query on local DB
async function runOnLocal(query, values = []) {
  try {
    const result = await localPool.query(query, values);
    console.log("✅ Local DB affected rows:", result.rowCount);
    return result;
  } catch (err) {
    console.error("❌ Local DB error:", err.message);
    throw err;
  }
}

// ✅ Update stock by ID
app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  try {
    await runOnLocal(
      "UPDATE products SET stock = $1 WHERE id = $2",
      [stock, id]
    );
    res.json({ message: "Stock updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update stock" });
  }
});

// ✅ Add new product
app.post("/products", async (req, res) => {
  const { name, barcode, price, stock } = req.body;

  try {
    await runOnLocal(
      "INSERT INTO products (name, barcode, price, stock) VALUES ($1, $2, $3, $4)",
      [name, barcode, price, stock]
    );
    res.json({ message: "Product added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add product" });
  }
});

// ✅ Save user settings
app.post("/user/settings", async (req, res) => {
  const { username, email, theme } = req.body;

  try {
    await runOnLocal(
      `INSERT INTO users (username, email, theme)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET username = EXCLUDED.username, theme = EXCLUDED.theme`,
      [username, email, theme]
    );
    res.json({ message: "Settings saved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to save settings" });
  }
});

// ✅ Get all products
app.get("/products", async (req, res) => {
  try {
    const result = await runOnLocal("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
