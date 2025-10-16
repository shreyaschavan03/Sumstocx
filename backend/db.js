import pkg from "pg";
import { supabase } from './config/supabase.js';

const { Pool } = pkg;

// Local PostgreSQL pool
export const localPool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "inventorydb",
  password: "Secure@123",
  port: 5432,
});

// Supabase PostgreSQL pool - UPDATED CONNECTION
export const supabasePool = new Pool({
  connectionString: "postgresql://postgres.gpfesrlqguapdnvgpjrv:IsFd89778oLnTpTq@aws-0-ap-south-1.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

// Supabase client for easy CRUD operations
export const supabaseClient = supabase;

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const client = await supabasePool.connect();
    console.log('✅ Supabase connection successful');
    
    // Test a simple query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database time:', result.rows[0].now);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    console.error('❌ Full error:', error);
    return false;
  }
};

export default { 
  localPool, 
  supabasePool, 
  supabaseClient,
  testSupabaseConnection
};