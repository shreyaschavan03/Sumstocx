import { useState, useEffect } from "react";
import axios from "../api.js";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

export default function UpdateStock() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [stock, setStock] = useState("");
  const [scanning, setScanning] = useState(false);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  // Handle stock update
  const handleUpdate = async () => {
    if (!selected || stock === "") {
      alert("Please select a product and enter stock quantity.");
      return;
    }
    try {
      const updatedProduct = { ...selected, stock: Number(stock) };
      await axios.put(`/products/${selected.id}`, updatedProduct);
      alert("Stock updated successfully!");
      setSelected(null);
      setStock("");
    } catch (err) {
      console.error("Error updating stock:", err);
      alert("Failed to update stock.");
    }
  };

  // Handle barcode scan
  const handleScan = (result) => {
    if (!result) return;
    const barcode = result.text || result; // handle different formats
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      setSelected(product);
      setStock(product.stock);
    } else {
      alert("Product not found!");
    }
    setScanning(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Update Stock</h2>

      {/* Scan button */}
      <button
        onClick={() => setScanning(!scanning)}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
      >
        {scanning ? "Stop Scanning" : "Scan Barcode"}
      </button>

      {/* Barcode Scanner */}
      {scanning && (
        <div className="mt-4 border rounded-lg overflow-hidden">
          <BarcodeScannerComponent
            onUpdate={(err, result) => {
              if (result) handleScan(result.text);
            }}
          />
          <p className="text-gray-500 mt-2 text-center p-2">
            Point your camera at the product barcode
          </p>
        </div>
      )}

      {/* Selected product */}
      {selected && (
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 mt-6">
          <p className="font-semibold text-lg">Product: {selected.name}</p>
          <p className="text-gray-600">Current Stock: {selected.stock}</p>

          <input
            type="number"
            placeholder="Enter new stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleUpdate}
            className="bg-green-500 text-white px-5 py-3 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Update Stock
          </button>
        </div>
      )}

      {/* Optional: List all products */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">All Products</h3>
        <div className="space-y-2">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center p-3 border rounded-lg hover:shadow cursor-pointer"
              onClick={() => {
                setSelected(p);
                setStock(p.stock);
              }}
            >
              <p>{p.name}</p>
              <p className="text-gray-500">Stock: {p.stock}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
