import express from "express";
import cors from "cors";
import db from "./db.js";
import { supabase } from "./config/supabase.js";

const { localPool, supabasePool } = db;

const app = express();
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Helper function for Supabase queries with table existence check
async function runOnSupabase(query, values = [], userId = null) {
  try {
    let finalQuery = query;
    let finalValues = values;

    // Add user filter if userId is provided
    if (userId && !query.includes("INSERT")) {
      if (query.includes("WHERE")) {
        finalQuery = query.replace(
          "WHERE",
          `WHERE created_by = $${values.length + 1} AND`
        );
        finalValues = [...values, userId];
      } else if (query.includes("UPDATE") || query.includes("DELETE")) {
        finalQuery = `${query} AND created_by = $${values.length + 1}`;
        finalValues = [...values, userId];
      } else {
        finalQuery = `${query} WHERE created_by = $${values.length + 1}`;
        finalValues = [...values, userId];
      }
    }

    const result = await supabasePool.query(finalQuery, finalValues);
    return result;
  } catch (err) {
    console.error("❌ Supabase DB error:", err.message);

    // Check if it's a "relation does not exist" error
    if (err.message.includes("does not exist")) {
      const tableName = err.message.match(/"([^"]+)"/)?.[1] || "table";
      throw new Error(
        `Table '${tableName}' does not exist. Please run the setup SQL first.`
      );
    }

    throw err;
  }
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "SumstocX Backend is running" });
});

// Check database setup
app.get("/api/setup/check", async (req, res) => {
  try {
    const tables = [
      "users",
      "products",
      "suppliers",
      "inventory_transactions",
      "categories",
    ];
    const results = {};

    for (const table of tables) {
      try {
        const result = await supabasePool.query(
          `SELECT COUNT(*) FROM ${table}`
        );
        results[table] = {
          exists: true,
          count: parseInt(result.rows[0].count),
        };
      } catch (err) {
        results[table] = { exists: false, error: err.message };
      }
    }

    res.json({ tables: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AUTH ROUTES
app.post("/api/auth/register", async (req, res) => {
  const { email, password, full_name, company_name } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          company_name,
        },
      },
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Create user record in our users table
    try {
      await runOnSupabase(
        `INSERT INTO users (id, email, full_name, company_name) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (email) DO UPDATE SET 
           full_name = EXCLUDED.full_name,
           company_name = EXCLUDED.company_name`,
        [data.user.id, email, full_name, company_name]
      );
    } catch (dbError) {
      console.log("Note: Users table might not exist yet:", dbError.message);
    }

    res.json({
      message:
        "Registration successful. Please check your email for verification.",
      user: data.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({
      message: "Login successful",
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

// PRODUCT ROUTES (Protected)
app.get("/api/products", authenticateToken, async (req, res) => {
  try {
    const result = await runOnSupabase(
      `SELECT p.*, s.name as supplier_name 
       FROM products p 
       LEFT JOIN suppliers s ON p.supplier_id = s.id 
       ORDER BY p.created_at DESC`,
      [],
      req.user.id
    );

    res.json(result.rows);
  } catch (err) {
    if (err.message.includes("does not exist")) {
      return res.status(404).json({
        message: "Products table not found",
        error: "Please run the database setup script first",
      });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Add new product
app.post("/api/products", authenticateToken, async (req, res) => {
  const {
    name,
    description,
    sku,
    category,
    price,
    cost,
    quantity,
    min_stock_level,
    max_stock_level,
    supplier_id,
    barcode,
  } = req.body;

  try {
    const productQuery = `
      INSERT INTO products (
        name, description, sku, category, price, cost, quantity, 
        min_stock_level, max_stock_level, supplier_id, barcode, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await runOnSupabase(productQuery, [
      name,
      description,
      sku,
      category,
      price,
      cost,
      quantity,
      min_stock_level,
      max_stock_level,
      supplier_id,
      barcode,
      req.user.id,
    ]);

    res.json({
      message: "Product added successfully",
      product: result.rows[0],
    });
  } catch (err) {
    if (err.message.includes("does not exist")) {
      return res.status(404).json({
        message: "Products table not found",
        error: "Please run the database setup script first",
      });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to add product" });
  }
});

// SUPPLIER ROUTES (Protected)
app.get("/api/suppliers", authenticateToken, async (req, res) => {
  try {
    const result = await runOnSupabase(
      "SELECT * FROM suppliers ORDER BY created_at DESC",
      [],
      req.user.id
    );

    res.json(result.rows);
  } catch (err) {
    if (err.message.includes("does not exist")) {
      return res.status(404).json({
        message: "Suppliers table not found",
        error: "Please run the database setup script first",
      });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to fetch suppliers" });
  }
});

app.post("/api/suppliers", authenticateToken, async (req, res) => {
  const {
    name,
    contact_person,
    email,
    phone,
    address,
    city,
    country,
    tax_id,
    payment_terms,
  } = req.body;

  try {
    const result = await runOnSupabase(
      `INSERT INTO suppliers (
        name, contact_person, email, phone, address, city, country, tax_id, payment_terms, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        name,
        contact_person,
        email,
        phone,
        address,
        city,
        country,
        tax_id,
        payment_terms,
        req.user.id,
      ]
    );

    res.json({
      message: "Supplier added successfully",
      supplier: result.rows[0],
    });
  } catch (err) {
    if (err.message.includes("does not exist")) {
      return res.status(404).json({
        message: "Suppliers table not found",
        error: "Please run the database setup script first",
      });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to add supplier" });
  }
});

// DASHBOARD STATS (Protected)
// DASHBOARD ROUTES (Protected)
app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
  try {
    // Get products count and value
    const productsResult = await supabasePool.query(
      "SELECT COUNT(*) as total_products, SUM(quantity * price) as total_value FROM products WHERE created_by = $1",
      [req.user.id]
    );

    // Get low stock count
    const lowStockResult = await supabasePool.query(
      "SELECT COUNT(*) as low_stock FROM products WHERE quantity > 0 AND quantity <= min_stock_level AND created_by = $1",
      [req.user.id]
    );

    // Get out of stock count
    const outOfStockResult = await supabasePool.query(
      "SELECT COUNT(*) as out_of_stock FROM products WHERE quantity = 0 AND created_by = $1",
      [req.user.id]
    );

    // Get suppliers count
    const suppliersResult = await supabasePool.query(
      "SELECT COUNT(*) as total_suppliers FROM suppliers WHERE created_by = $1",
      [req.user.id]
    );

    const stats = {
      totalProducts: parseInt(productsResult.rows[0].total_products) || 0,
      totalValue: parseFloat(productsResult.rows[0].total_value) || 0,
      lowStock: parseInt(lowStockResult.rows[0].low_stock) || 0,
      outOfStock: parseInt(outOfStockResult.rows[0].out_of_stock) || 0,
      totalSuppliers: parseInt(suppliersResult.rows[0].total_suppliers) || 0,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

app.get(
  "/api/dashboard/recent-products",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await supabasePool.query(
        "SELECT * FROM products WHERE created_by = $1 ORDER BY created_at DESC LIMIT 5",
        [req.user.id]
      );

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching recent products:", error);
      res.status(500).json({ message: "Failed to fetch recent products" });
    }
  }
);

// Get recent products for dashboard
app.get(
  "/api/dashboard/recent-products",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await runOnSupabase(
        "SELECT * FROM products ORDER BY created_at DESC LIMIT 5",
        [],
        req.user.id
      );

      res.json(result.rows);
    } catch (err) {
      if (err.message.includes("does not exist")) {
        return res.json([]); // Return empty array if table doesn't exist
      }
      console.error(err);
      res.status(500).json({ message: "Failed to fetch recent products" });
    }
  }
);

// Add these routes after your existing imports and middleware

app.post("/api/auth/register", async (req, res) => {
  const { email, password, full_name, company_name } = req.body;

  console.log("📝 Registration attempt:", { email, full_name, company_name });

  try {
    // Use the supabaseClient from your db.js
    const { data, error } = await db.supabaseClient.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          full_name,
          company_name,
        },
      },
    });

    if (error) {
      console.error("❌ Supabase auth error:", error);
      return res.status(400).json({ message: error.message });
    }

    console.log("✅ User created in auth.users, ID:", data.user.id);

    // Create user record in our public users table using supabasePool
    try {
      console.log("🔄 Attempting to create user in public.users...");

      const userInsertResult = await db.supabasePool.query(
        `INSERT INTO public.users (id, email, full_name, company_name) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [data.user.id, email, full_name, company_name]
      );

      console.log(
        "✅ User created in public.users table:",
        userInsertResult.rows[0]
      );
    } catch (dbError) {
      console.error("❌ Error creating user in public.users table:", dbError);
    }

    res.json({
      message:
        "Registration successful! Please check your email for verification.",
      user: data.user,
    });
  } catch (err) {
    console.error("🚨 Server error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Check if user exists in public.users table, if not create them
    try {
      const userCheck = await supabasePool.query(
        "SELECT * FROM public.users WHERE id = $1",
        [data.user.id]
      );

      if (userCheck.rows.length === 0) {
        // User doesn't exist in public.users, create them
        const userMeta = data.user.user_metadata || {};
        await supabasePool.query(
          `INSERT INTO public.users (id, email, full_name, company_name) 
           VALUES ($1, $2, $3, $4)`,
          [
            data.user.id,
            data.user.email,
            userMeta.full_name,
            userMeta.company_name,
          ]
        );
        console.log("✅ Created missing user in public.users table");
      }

      // Update last login
      await supabasePool.query(
        "UPDATE public.users SET last_login = NOW() WHERE id = $1",
        [data.user.id]
      );
    } catch (dbError) {
      console.error("Error syncing user to public.users:", dbError);
    }

    res.json({
      message: "Login successful",
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const result = await supabasePool.query(
      "SELECT * FROM public.users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      // User doesn't exist in public.users, create them from auth data
      const userMeta = req.user.user_metadata || {};
      const insertResult = await supabasePool.query(
        `INSERT INTO public.users (id, email, full_name, company_name) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [req.user.id, req.user.email, userMeta.full_name, userMeta.company_name]
      );

      return res.json({ user: insertResult.rows[0] });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

app.put("/api/auth/profile", authenticateToken, async (req, res) => {
  const { full_name, company_name, email, phone, theme } = req.body;

  try {
    const result = await supabasePool.query(
      `INSERT INTO users (id, email, full_name, company_name, phone, theme)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id)
       DO UPDATE SET 
         full_name = EXCLUDED.full_name,
         company_name = EXCLUDED.company_name,
         email = EXCLUDED.email,
         phone = EXCLUDED.phone,
         theme = EXCLUDED.theme,
         updated_at = NOW()
       RETURNING *`,
      [req.user.id, email, full_name, company_name, phone, theme]
    );

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
