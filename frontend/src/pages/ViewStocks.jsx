import { useState, useEffect } from "react";
import axios from "../api.js";

export default function ViewStocks() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("/products").then(res => setProducts(res.data));
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">View Stocks</h2>

      <input
        type="text"
        placeholder="Search product..."
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white rounded-xl shadow-lg animate-fadeIn">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-3 px-6">ID</th>
              <th className="py-3 px-6">Name</th>
              <th className="py-3 px-6">Barcode</th>
              <th className="py-3 px-6">Price</th>
              <th className="py-3 px-6">Stock</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b hover:bg-blue-50">
                <td className="py-3 px-6">{p.id}</td>
                <td className="py-3 px-6">{p.name}</td>
                <td className="py-3 px-6">{p.barcode}</td>
                <td className="py-3 px-6">${p.price}</td>
                <td className="py-3 px-6">{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
