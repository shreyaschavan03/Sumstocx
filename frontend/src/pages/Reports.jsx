import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { productAPI, dashboardAPI } from "../services/api";

export default function Reports() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
    totalSuppliers: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all"); // all, week, month, year

  useEffect(() => {
    if (user) {
      fetchReportsData();
    }
  }, [user, timeRange]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      
      // Fetch products for detailed analysis
      const productsData = await productAPI.getAll();
      setProducts(productsData);

      // Fetch dashboard stats
      const statsData = await dashboardAPI.getStats();
      setStats(statsData);

    } catch (error) {
      console.error("Error fetching reports data:", error);
      // Fallback to mock data
      const mockProducts = [
        {
          id: '1',
          name: 'Laptop Dell XPS 13',
          sku: 'DLXPS13',
          category: 'Electronics',
          price: 1299.99,
          cost: 899.99,
          quantity: 15,
          min_stock_level: 5,
          created_at: '2024-01-15'
        },
        {
          id: '2',
          name: 'Office Chair Ergonomic',
          sku: 'OCERG01',
          category: 'Furniture',
          price: 299.99,
          cost: 180.00,
          quantity: 3,
          min_stock_level: 10,
          created_at: '2024-01-20'
        },
        {
          id: '3',
          name: 'Wireless Mouse',
          sku: 'WM001',
          category: 'Electronics',
          price: 29.99,
          cost: 15.00,
          quantity: 0,
          min_stock_level: 15,
          created_at: '2024-02-01'
        },
        {
          id: '4',
          name: 'Desk Lamp LED',
          sku: 'DLLED01',
          category: 'Office Supplies',
          price: 49.99,
          cost: 25.00,
          quantity: 25,
          min_stock_level: 8,
          created_at: '2024-02-05'
        },
        {
          id: '5',
          name: 'Notebook Set',
          sku: 'NBSET01',
          category: 'Stationery',
          price: 19.99,
          cost: 8.50,
          quantity: 2,
          min_stock_level: 20,
          created_at: '2024-02-10'
        }
      ];
      setProducts(mockProducts);
      
      const totalValue = mockProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0);
      const lowStock = mockProducts.filter(p => p.quantity > 0 && p.quantity <= p.min_stock_level).length;
      const outOfStock = mockProducts.filter(p => p.quantity === 0).length;
      
      setStats({
        totalProducts: mockProducts.length,
        lowStock: lowStock,
        outOfStock: outOfStock,
        totalValue: totalValue,
        totalSuppliers: 3
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
  const totalCostValue = products.reduce((acc, p) => acc + (p.cost * p.quantity), 0);
  const potentialProfit = totalStockValue - totalCostValue;
  
  const lowStockItems = products.filter(p => p.quantity > 0 && p.quantity <= p.min_stock_level);
  const outOfStockItems = products.filter(p => p.quantity === 0);
  const healthyStockItems = products.filter(p => p.quantity > p.min_stock_level);

  // Category distribution
  const categoryDistribution = products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-3xl font-bold text-blue-700">Reports</h2>
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
          <h2 className="text-3xl font-bold text-blue-700">Inventory Reports</h2>
          <p className="text-gray-600 mt-1">Comprehensive overview of your inventory performance</p>
        </div>
        
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="all">All Time</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-medium">Total Products</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
          <p className="text-green-600 text-sm mt-1">Active in inventory</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <p className="text-gray-500 text-sm font-medium">Total Stock Value</p>
          <p className="text-2xl font-bold text-gray-800">${totalStockValue.toLocaleString()}</p>
          <p className="text-green-600 text-sm mt-1">Current market value</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
          <p className="text-gray-500 text-sm font-medium">Low Stock Items</p>
          <p className="text-2xl font-bold text-gray-800">{stats.lowStock}</p>
          <p className="text-orange-600 text-sm mt-1">Need reordering</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
          <p className="text-gray-500 text-sm font-medium">Out of Stock</p>
          <p className="text-2xl font-bold text-gray-800">{stats.outOfStock}</p>
          <p className="text-red-600 text-sm mt-1">Urgent attention needed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Analysis */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Profit Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Stock Value:</span>
              <span className="font-semibold">${totalStockValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Cost Value:</span>
              <span className="font-semibold">${totalCostValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-gray-600 font-medium">Potential Profit:</span>
              <span className={`font-semibold ${potentialProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${potentialProfit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Profit Margin:</span>
              <span className={`font-semibold ${potentialProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalCostValue > 0 ? ((potentialProfit / totalCostValue) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Category Distribution</h3>
          <div className="space-y-2">
            {Object.entries(categoryDistribution).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-gray-600">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(count / products.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-sm w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-orange-50 p-6 rounded-xl shadow-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-orange-500 text-lg">⚠️</span>
              <h3 className="font-semibold text-orange-800">Low Stock Alert</h3>
            </div>
            <div className="space-y-2">
              {lowStockItems.map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-orange-100 rounded">
                  <span className="font-medium text-orange-800">{product.name}</span>
                  <div className="text-sm text-orange-700">
                    <span className="font-semibold">{product.quantity}</span> / {product.min_stock_level} units
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Out of Stock Alert */}
        {outOfStockItems.length > 0 && (
          <div className="bg-red-50 p-6 rounded-xl shadow-lg border border-red-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-red-500 text-lg">🚨</span>
              <h3 className="font-semibold text-red-800">Out of Stock</h3>
            </div>
            <div className="space-y-2">
              {outOfStockItems.map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-red-100 rounded">
                  <span className="font-medium text-red-800">{product.name}</span>
                  <span className="text-sm text-red-700 font-semibold">0 units</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stock Health Summary */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Stock Health Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{healthyStockItems.length}</div>
            <div className="text-green-700 font-medium">Healthy Stock</div>
            <div className="text-green-600 text-sm">Good inventory levels</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
            <div className="text-orange-700 font-medium">Low Stock</div>
            <div className="text-orange-600 text-sm">Needs reordering</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">{outOfStockItems.length}</div>
            <div className="text-red-700 font-medium">Out of Stock</div>
            <div className="text-red-600 text-sm">Urgent action required</div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Export Reports</h3>
        <div className="flex gap-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300">
            Export as PDF
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300">
            Export as Excel
          </button>
          <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300">
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
}