import { useEffect, useState } from "react";
import axios from "../api.js";

export default function Reports() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("/products").then(res => setProducts(res.data));
  }, []);

  const totalStockValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
  const lowStock = products.filter(p => p.stock <= 5);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg animate-fadeIn">
          <p className="text-gray-500">Total Products</p>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg animate-fadeIn">
          <p className="text-gray-500">Low Stock Items</p>
          <p className="text-2xl font-bold">{lowStock.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg animate-fadeIn">
          <p className="text-gray-500">Total Stock Value</p>
          <p className="text-2xl font-bold">${totalStockValue}</p>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg animate-fadeIn">
          <h3 className="font-semibold">⚠️ Low Stock Alert</h3>
          <ul className="list-disc list-inside">
            {lowStock.map(p => (
              <li key={p.id}>{p.name} — {p.stock} left</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
