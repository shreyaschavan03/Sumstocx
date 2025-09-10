import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM products ORDER BY id DESC");
  res.json(result.rows);
});

// POST add product
router.post("/", async (req, res) => {
  const { name, barcode, price, stock } = req.body;
  const result = await pool.query(
    "INSERT INTO products(name, barcode, price, stock) VALUES($1,$2,$3,$4) RETURNING *",
    [name, barcode, price, stock]
  );
  res.json(result.rows[0]);
});

// PUT update product
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, barcode, price, stock } = req.body;
  const result = await pool.query(
    "UPDATE products SET name=$1, barcode=$2, price=$3, stock=$4 WHERE id=$5 RETURNING *",
    [name, barcode, price, stock, id]
  );
  res.json(result.rows[0]);
});

// DELETE product
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM products WHERE id=$1", [id]);
  res.json({ success: true });
});

export default router;
