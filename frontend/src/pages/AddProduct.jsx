  import { useState, useEffect } from "react";
  import { useAuth } from "../contexts/AuthContext";
  import { productAPI, supplierAPI } from "../services/api";

  export default function AddProduct() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      sku: "",
      category: "",
      price: "",
      cost: "",
      quantity: "",
      min_stock_level: "",
      max_stock_level: "",
      supplier_id: "",
      barcode: ""
    });
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Fetch suppliers for dropdown
    useEffect(() => {
      if (user) {
        fetchSuppliers();
      }
    }, [user]);

    const fetchSuppliers = async () => {
      try {
        const data = await supplierAPI.getAll();
        setSuppliers(data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        // Fallback to mock suppliers
        setSuppliers([
          { id: '1', name: 'Tech Supplies Inc.' },
          { id: '2', name: 'Office World' },
          { id: '3', name: 'Global Electronics' }
        ]);
      }
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleAdd = async () => {
      // Validate required fields
      if (!formData.name || !formData.sku || !formData.price || !formData.cost) {
        setMessage("Please fill in all required fields!");
        return;
      }

      if (isNaN(formData.price) || isNaN(formData.cost)) {
        setMessage("Price and cost must be valid numbers!");
        return;
      }

      try {
        setLoading(true);
        setMessage("");

        // Prepare product data
        const productData = {
          name: formData.name,
          description: formData.description,
          sku: formData.sku,
          category: formData.category,
          price: parseFloat(formData.price),
          cost: parseFloat(formData.cost),
          quantity: parseInt(formData.quantity) || 0,
          min_stock_level: parseInt(formData.min_stock_level) || 0,
          max_stock_level: formData.max_stock_level ? parseInt(formData.max_stock_level) : null,
          supplier_id: formData.supplier_id || null,
          barcode: formData.barcode
        };

        // Add product using API
        await productAPI.create(productData);

        setMessage("Product added successfully!");
        
        // Reset form
        setFormData({
          name: "",
          description: "",
          sku: "",
          category: "",
          price: "",
          cost: "",
          quantity: "",
          min_stock_level: "",
          max_stock_level: "",
          supplier_id: "",
          barcode: ""
        });

      } catch (error) {
        console.error("Error adding product:", error);
        setMessage("Failed to add product. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const generateSKU = () => {
      const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : 'PRO';
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const sku = `${prefix}${random}`;
      setFormData(prev => ({ ...prev, sku }));
    };

    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-blue-700">Add New Product</h2>
          <p className="text-gray-600 mt-2">Add a new product to your inventory</p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter product name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="sku"
                    placeholder="Product SKU"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={formData.sku}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={generateSKU}
                    className="bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition duration-300"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode
                </label>
                <input
                  type="text"
                  name="barcode"
                  placeholder="Product barcode"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.barcode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Product description"
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Pricing & Cost */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Pricing & Cost</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selling Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    name="price"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    name="cost"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={formData.cost}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Management */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Inventory Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="0"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stock Level
                </label>
                <input
                  type="number"
                  name="min_stock_level"
                  placeholder="0"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.min_stock_level}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Stock Level
                </label>
                <input
                  type="number"
                  name="max_stock_level"
                  placeholder="Optional"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.max_stock_level}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Supplier Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Supplier Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier
                </label>
                <select
                  name="supplier_id"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.supplier_id}
                  onChange={handleChange}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleAdd}
              disabled={loading}
              className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:bg-green-300 transition duration-300 font-semibold"
            >
              {loading ? "Adding Product..." : "Add Product"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: "",
                  description: "",
                  sku: "",
                  category: "",
                  price: "",
                  cost: "",
                  quantity: "",
                  min_stock_level: "",
                  max_stock_level: "",
                  supplier_id: "",
                  barcode: ""
                });
                setMessage("");
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-300"
            >
              Clear Form
            </button>
          </div>
        </div>

        {/* Required Fields Note */}
        <div className="text-sm text-gray-500 text-center">
          * indicates required fields
        </div>
      </div>
    );
  }