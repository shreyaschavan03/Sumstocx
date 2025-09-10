import { useState } from "react";
import axios from "../api.js";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const handleAdd = async () => {
    if (!name || !barcode || !price || !stock) {
      alert("Please fill all fields!");
      return;
    }

    try {
      await axios.post("/products", {
        name,
        barcode,
        price: Number(price),
        stock: Number(stock)
      });
      alert("Product added!");
      setName(""); setBarcode(""); setPrice(""); setStock("");
    } catch (error) {
      console.error(error);
      alert("Failed to add product.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Add New Product</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input
          type="text"
          placeholder="Product Name"
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Barcode"
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={price}
          onChange={e => setPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Stock Quantity"
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={stock}
          onChange={e => setStock(e.target.value)}
        />
      </div>

      <button
        onClick={handleAdd}
        className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 transition duration-300"
      >
        Add Product
      </button>
    </div>
  );
}
