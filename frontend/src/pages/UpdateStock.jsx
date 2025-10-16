import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { productAPI } from "../services/api";

export default function UpdateStock() {
  const { user, getSession } = useAuth();
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [stock, setStock] = useState("");
  const [transactionType, setTransactionType] = useState("ADJUSTMENT");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch products from backend
  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const data = await productAPI.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Fallback to mock data
      setProducts([
        {
          id: '1',
          name: 'Laptop Dell XPS 13',
          sku: 'DLXPS13',
          quantity: 15,
          min_stock_level: 5,
          price: 1299.99,
          barcode: '123456789012'
        },
        {
          id: '2',
          name: 'Office Chair Ergonomic',
          sku: 'OCERG01',
          quantity: 8,
          min_stock_level: 10,
          price: 299.99,
          barcode: '123456789013'
        },
        {
          id: '3',
          name: 'Wireless Mouse',
          sku: 'WM001',
          quantity: 25,
          min_stock_level: 15,
          price: 29.99,
          barcode: '123456789014'
        }
      ]);
    }
  };

  // Handle stock update
  const handleUpdate = async () => {
    if (!selected || stock === "") {
      alert("Please select a product and enter stock quantity.");
      return;
    }

    if (isNaN(stock) || stock < 0) {
      alert("Please enter a valid stock quantity.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // Update stock using the API
      await productAPI.updateStock(selected.id, {
        quantity: Number(stock),
        transaction_type: transactionType,
        notes: notes || `Stock ${transactionType.toLowerCase()}`
      });

      setMessage("Stock updated successfully!");
      
      // Refresh products list
      fetchProducts();
      
      // Reset form
      setSelected(null);
      setStock("");
      setNotes("");
      setTransactionType("ADJUSTMENT");
      
    } catch (error) {
      console.error("Error updating stock:", error);
      setMessage("Failed to update stock. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle manual barcode input (since we removed the scanner dependency)
  const handleBarcodeInput = (barcode) => {
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      setSelected(product);
      setStock(product.quantity.toString());
    } else {
      alert("Product not found with this barcode!");
    }
  };

  const getStockStatus = (quantity, minStock) => {
    if (quantity === 0) return { text: 'Out of Stock', class: 'text-red-600' };
    if (quantity <= minStock) return { text: 'Low Stock', class: 'text-orange-600' };
    return { text: 'In Stock', class: 'text-green-600' };
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-blue-700">Update Stock</h2>
        <p className="text-gray-600 mt-2">Manage your inventory stock levels</p>
      </div>

      {/* Manual Barcode Input */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Manual Barcode Entry</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter barcode manually"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleBarcodeInput(e.target.value);
                e.target.value = '';
              }
            }}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="Enter barcode manually"]');
              handleBarcodeInput(input.value);
              input.value = '';
            }}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Search
          </button>
        </div>
      </div>

      {/* Selected product form */}
      {selected && (
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
          <div className="border-b pb-4">
            <h3 className="text-xl font-semibold text-gray-800">Update Stock for: {selected.name}</h3>
            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
              <div>
                <span className="font-medium">SKU:</span> {selected.sku}
              </div>
              <div>
                <span className="font-medium">Barcode:</span> {selected.barcode || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Current Stock:</span> {selected.quantity} units
              </div>
              <div>
                <span className="font-medium">Status:</span> 
                <span className={`ml-2 font-semibold ${getStockStatus(selected.quantity, selected.min_stock_level).class}`}>
                  {getStockStatus(selected.quantity, selected.min_stock_level).text}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Stock Quantity
              </label>
              <input
                type="number"
                placeholder="Enter new stock quantity"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="ADJUSTMENT">Stock Adjustment</option>
                <option value="IN">Stock In</option>
                <option value="OUT">Stock Out</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              placeholder="Add notes about this stock update..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${
              message.includes('successfully') 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:bg-green-300 transition duration-300 font-semibold"
            >
              {loading ? "Updating..." : "Update Stock"}
            </button>
            <button
              onClick={() => {
                setSelected(null);
                setStock("");
                setNotes("");
                setMessage("");
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4">All Products</h3>
        <div className="space-y-3">
          {products.map((product) => {
            const status = getStockStatus(product.quantity, product.min_stock_level);
            return (
              <div
                key={product.id}
                className={`flex justify-between items-center p-4 border rounded-lg hover:shadow-md cursor-pointer transition-all ${
                  selected?.id === product.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => {
                  setSelected(product);
                  setStock(product.quantity.toString());
                  setMessage("");
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-800">{product.name}</h4>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {product.sku}
                    </span>
                  </div>
                  {product.barcode && (
                    <p className="text-sm text-gray-500 mt-1">Barcode: {product.barcode}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">{product.quantity} units</p>
                  <p className={`text-sm font-medium ${status.class}`}>
                    {status.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}