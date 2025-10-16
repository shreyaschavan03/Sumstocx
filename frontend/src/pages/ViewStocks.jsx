import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { productAPI } from "../services/api";

export default function ViewStocks() {
  const { user, getSession } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Get session token for authenticated request
      const { data: { session } } = await getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Use the productAPI with token
      const data = await productAPI.getAll();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please check your connection.");
      
      // Fallback to mock data for demonstration
      setProducts([
        {
          id: '1',
          name: 'Laptop Dell XPS 13',
          sku: 'DLXPS13',
          barcode: '123456789012',
          category: 'Electronics',
          price: 1299.99,
          cost: 899.99,
          quantity: 15,
          min_stock_level: 5,
          description: '13-inch laptop with Intel i7 processor'
        },
        {
          id: '2',
          name: 'Office Chair Ergonomic',
          sku: 'OCERG01',
          barcode: '123456789013',
          category: 'Furniture',
          price: 299.99,
          cost: 180.00,
          quantity: 8,
          min_stock_level: 10,
          description: 'Comfortable ergonomic office chair'
        },
        {
          id: '3',
          name: 'Wireless Mouse',
          sku: 'WM001',
          barcode: '123456789014',
          category: 'Electronics',
          price: 29.99,
          cost: 15.00,
          quantity: 25,
          min_stock_level: 15,
          description: 'Bluetooth wireless mouse'
        },
        {
          id: '4',
          name: 'Desk Lamp LED',
          sku: 'DLLED01',
          barcode: '123456789015',
          category: 'Office Supplies',
          price: 49.99,
          cost: 25.00,
          quantity: 12,
          min_stock_level: 8,
          description: 'Energy efficient LED desk lamp'
        },
        {
          id: '5',
          name: 'Notebook Set',
          sku: 'NBSET01',
          barcode: '123456789016',
          category: 'Stationery',
          price: 19.99,
          cost: 8.50,
          quantity: 0,
          min_stock_level: 20,
          description: 'Set of 5 premium notebooks'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.toLowerCase().includes(search.toLowerCase())
  );

  const getStockStatus = (quantity, minStock) => {
    if (quantity === 0) {
      return { text: 'Out of Stock', class: 'bg-red-100 text-red-800' };
    } else if (quantity <= minStock) {
      return { text: 'Low Stock', class: 'bg-orange-100 text-orange-800' };
    } else {
      return { text: 'In Stock', class: 'bg-green-100 text-green-800' };
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-3xl font-bold text-blue-700">View Stocks</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-blue-700">View Stocks</h2>
          <p className="text-gray-600 mt-1">Manage and monitor your inventory</p>
        </div>
        <div className="text-sm text-gray-500">
          Total Products: {products.length}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, SKU, or barcode..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchProducts}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="py-4 px-6 text-left">Product</th>
                <th className="py-4 px-6 text-left">SKU</th>
                <th className="py-4 px-6 text-left">Category</th>
                <th className="py-4 px-6 text-left">Barcode</th>
                <th className="py-4 px-6 text-right">Price</th>
                <th className="py-4 px-6 text-right">Cost</th>
                <th className="py-4 px-6 text-right">Stock</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 px-6 text-center text-gray-500">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map(product => {
                  const stockStatus = getStockStatus(product.quantity, product.min_stock_level);
                  return (
                    <tr 
                      key={product.id} 
                      className="border-b hover:bg-blue-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {product.description}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-sm">{product.sku}</td>
                      <td className="py-4 px-6">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                          {product.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-sm">
                        {product.barcode || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-green-600">
                        ${product.price}
                      </td>
                      <td className="py-4 px-6 text-right text-gray-500">
                        ${product.cost}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold">
                        {product.quantity} units
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.class}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Showing {filtered.length} of {products.length} products
        </div>
      </div>
    </div>
  );
}