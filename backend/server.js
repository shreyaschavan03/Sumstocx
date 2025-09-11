import express from "express";
import cors from "cors";
import pool from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// Update stock of a product
app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  try {
    const result = await pool.query(
      "UPDATE products SET stock = $1 WHERE id = $2 RETURNING *",
      [stock, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Stock updated successfully", product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update stock" });
  }
});


// Example: Save user settings
app.post("/user/settings", async (req, res) => {
  try {
    const { username, email, theme } = req.body;

    const result = await pool.query(
      `INSERT INTO users (username, email, theme)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET username = EXCLUDED.username, theme = EXCLUDED.theme
       RETURNING *`,
      [username, email, theme]
    );

    res.json({ message: "Settings saved successfully", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save settings" });
  }
});

// Example: Get all products
app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
