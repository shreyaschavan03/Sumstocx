// Inventory-React-App (single-file scaffold)
// Save this as `src/App.jsx` in a Vite or Create-React-App project.
// Setup instructions (quick):
// 1) Create project: `npm create vite@latest inventory-app -- --template react` OR `npx create-react-app inventory-app`
// 2) Install packages:
//    npm install react-qr-barcode-scanner uuid axios
// 3) Install Tailwind (optional but recommended):
//    npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p
//    configure tailwind per docs (add ./src/**/*.{js,jsx} to content)
// 4) Replace src/App.jsx with this file and run `npm run dev` (Vite) or `npm start` (CRA)

import React, { useEffect, useState, useRef } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { v4 as uuidv4 } from 'uuid';

// ---------- Utility: localStorage persistence ----------
const STORAGE_KEY = 'inventory_products_v1';
const saveProducts = (products) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};
const loadProducts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load products', e);
    return null;
  }
};

// ---------- Sample initial data ----------
const SAMPLE_PRODUCTS = [
  { id: uuidv4(), name: 'Wheat Flour 1kg', price: 40, stock: 12, barcode: '8901234500001' },
  { id: uuidv4(), name: 'Sugar 1kg', price: 45, stock: 3, barcode: '8901234500002' },
  { id: uuidv4(), name: 'Tea 250g', price: 120, stock: 7, barcode: '8901234500003' },
];

// ---------- Main App (default export) ----------
export default function App() {
  const [products, setProducts] = useState(() => loadProducts() || SAMPLE_PRODUCTS);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null); // product to edit
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Low stock threshold (can make configurable in Settings)
  const LOW_STOCK_THRESHOLD = 5;

  useEffect(() => {
    saveProducts(products);
    const low = products.filter(p => p.stock <= LOW_STOCK_THRESHOLD);
    if (low.length) {
      pushToast(`Low stock: ${low.map(x => x.name).join(', ')}`, 'warning');
    }
  }, [products]);

  // ---------- Toasts ----------
  function pushToast(message, level = 'info') {
    const id = uuidv4();
    setToasts(t => [...t, { id, message, level }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  }

  // ---------- CRUD operations ----------
  function addProduct(newProduct) {
    setProducts(p => [{ ...newProduct, id: uuidv4() }, ...p]);
    pushToast('Product added');
  }
  function updateProduct(id, changes) {
    setProducts(p => p.map(x => x.id === id ? { ...x, ...changes } : x));
    pushToast('Product updated');
  }
  function deleteProduct(id) {
    const prod = products.find(x => x.id === id);
    if (!prod) return;
    if (!window.confirm(`Delete ${prod.name}?`)) return;
    setProducts(p => p.filter(x => x.id !== id));
    pushToast('Product deleted');
  }

  // ---------- Barcode scan handler ----------
  function onBarcodeDetected(code) {
    // Try to find product by barcode
    const found = products.find(p => p.barcode === code);
    if (found) {
      // Quick action: increase stock by 1 (shopkeeper can change later)
      updateProduct(found.id, { stock: found.stock + 1 });
      pushToast(`Scanned: ${found.name} — stock incremented`);
    } else {
      // If not found, open Add modal prefilled with barcode
      setSelected({ name: '', price: 0, stock: 1, barcode: code });
      setShowAddModal(true);
      pushToast('Unknown barcode scanned — fill product details to add');
    }
  }

  // ---------- Derived data ----------
  const filtered = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.barcode.includes(query));
  const totalStockValue = products.reduce((s, p) => s + (p.stock * (Number(p.price) || 0)), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <Topbar
            query={query}
            setQuery={setQuery}
            onAdd={() => { setSelected(null); setShowAddModal(true); }}
            onOpenScanner={() => setShowScanner(s => !s)}
            totalProducts={products.length}
            totalStockValue={totalStockValue}
          />

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DashboardCard title="Products" value={products.length} />
            <DashboardCard title="Unique Barcodes" value={new Set(products.map(p=>p.barcode)).size} />
            <DashboardCard title="Total Stock Value" value={`₹ ${totalStockValue}`} />
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ViewStocks
                products={filtered}
                onEdit={(p) => { setSelected(p); setShowAddModal(true); }}
                onDelete={deleteProduct}
                onQuickAdjust={(id, delta) => {
                  const prod = products.find(x => x.id === id);
                  if (!prod) return;
                  updateProduct(id, { stock: Math.max(0, prod.stock + delta) });
                }}
                lowThreshold={LOW_STOCK_THRESHOLD}
              />
            </div>
            <div>
              <RightPanel
                products={products}
                lowThreshold={LOW_STOCK_THRESHOLD}
                onOpenScanner={() => setShowScanner(true)}
                onExport={() => {
                  const csv = toCSV(products);
                  downloadFile(csv, 'products.csv', 'text/csv');
                }}
              />
            </div>
          </div>

          {showScanner && (
            <div className="mt-6">
              <ScannerPanel onDetected={onBarcodeDetected} onClose={() => setShowScanner(false)} />
            </div>
          )}

          {showAddModal && (
            <AddEditModal
              initial={selected}
              onClose={() => { setShowAddModal(false); setSelected(null); }}
              onSave={(payload) => {
                if (payload.id) updateProduct(payload.id, payload);
                else addProduct(payload);
                setShowAddModal(false);
                setSelected(null);
              }}
            />
          )}

          <ToastGroup toasts={toasts} />
        </div>
      </div>
    </div>
  );
}

// ---------- Small UI components ----------
function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r">
      <div className="p-6">
        <h2 className="text-xl font-bold">ShopInventory</h2>
        <p className="text-sm text-gray-500 mt-1">Simple React + localStorage</p>
      </div>
      <nav className="px-4 py-2 text-sm">
        <a className="block py-2 rounded hover:bg-gray-100">Dashboard</a>
        <a className="block py-2 rounded hover:bg-gray-100">View Stocks</a>
        <a className="block py-2 rounded hover:bg-gray-100">Reports</a>
        <a className="block py-2 rounded hover:bg-gray-100">Settings</a>
      </nav>
    </aside>
  );
}

function Topbar({ query, setQuery, onAdd, onOpenScanner, totalProducts, totalStockValue }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name or barcode" className="border p-2 rounded w-80" />
        <button onClick={onAdd} className="px-3 py-2 bg-blue-600 text-white rounded">+ Add Product</button>
        <button onClick={onOpenScanner} className="px-3 py-2 border rounded">Open Scanner</button>
      </div>
      <div className="text-right text-sm text-gray-600">
        <div>Products: <b>{totalProducts}</b></div>
        <div>Value: <b>{totalStockValue}</b></div>
      </div>
    </div>
  );
}

function DashboardCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
    </div>
  );
}

function ViewStocks({ products, onEdit, onDelete, onQuickAdjust, lowThreshold }) {
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="font-semibold mb-3">View Stocks</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">Name</th>
              <th>Barcode</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className={`border-t ${p.stock <= lowThreshold ? 'bg-red-50' : ''}`}>
                <td className="py-2">{p.name}</td>
                <td>{p.barcode}</td>
                <td>₹ {p.price}</td>
                <td>{p.stock}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => onQuickAdjust(p.id, -1)} className="px-2 py-1 border rounded">-</button>
                    <button onClick={() => onQuickAdjust(p.id, 1)} className="px-2 py-1 border rounded">+</button>
                    <button onClick={() => onEdit(p)} className="px-2 py-1 bg-yellow-100 rounded">Edit</button>
                    <button onClick={() => onDelete(p.id)} className="px-2 py-1 bg-red-100 rounded">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-gray-500">No products</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RightPanel({ products, lowThreshold, onOpenScanner, onExport }) {
  const low = products.filter(p => p.stock <= lowThreshold);
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h4 className="font-semibold">Quick Actions</h4>
      <div className="mt-3">
        <button onClick={onOpenScanner} className="w-full px-3 py-2 border rounded mb-2">Scan Barcode</button>
        <button onClick={onExport} className="w-full px-3 py-2 border rounded">Export CSV</button>
      </div>
      <div className="mt-4">
        <div className="text-sm text-gray-600">Low stock items</div>
        <ul className="mt-2 text-sm">
          {low.length ? low.map(l => <li key={l.id}>• {l.name} ({l.stock})</li>) : <li className="text-gray-400">None</li>}
        </ul>
      </div>
    </div>
  );
}

function ScannerPanel({ onDetected, onClose }) {
  const [error, setError] = useState(null);
  const [lastCode, setLastCode] = useState(null);

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Barcode Scanner</h4>
        <button onClick={onClose} className="px-2 py-1 border rounded">Close</button>
      </div>

      <div className="mt-4">
        <div style={{ width: '100%', maxWidth: 480 }}>
          <BarcodeScannerComponent
            onUpdate={(err, result) => {
              if (err) {
                setError(err?.message || 'Camera error');
                return;
              }
              if (result && result?.text) {
                const code = result.text;
                // Avoid rapid duplicates
                if (code === lastCode) return;
                setLastCode(code);
                onDetected(code);
              }
            }}
          />
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </div>
  );
}

function AddEditModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    id: initial?.id || null,
    name: initial?.name || '',
    price: initial?.price || 0,
    stock: initial?.stock || 1,
    barcode: initial?.barcode || ''
  }));

  function submit(e) {
    e.preventDefault();
    if (!form.name || !form.barcode) return alert('Please fill name and barcode');
    onSave(form);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-30">
      <form onSubmit={submit} className="bg-white p-6 rounded w-full max-w-md">
        <h3 className="text-lg font-semibold mb-3">{form.id ? 'Edit Product' : 'Add Product'}</h3>
        <div className="grid gap-2">
          <label className="text-sm">Name</label>
          <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="border p-2 rounded" />
          <label className="text-sm">Barcode</label>
          <input value={form.barcode} onChange={e=>setForm({...form, barcode: e.target.value})} className="border p-2 rounded" />
          <label className="text-sm">Price</label>
          <input type="number" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} className="border p-2 rounded" />
          <label className="text-sm">Stock</label>
          <input type="number" value={form.stock} onChange={e=>setForm({...form, stock: parseInt(e.target.value||0)})} className="border p-2 rounded" />

          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Save</button>
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function ToastGroup({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
      {toasts.map(t => (
        <div key={t.id} className="bg-white p-3 rounded shadow border">{t.message}</div>
      ))}
    </div>
  );
}

// ---------- Small helpers ----------
function toCSV(products) {
  const headers = ['id','name','barcode','price','stock'];
  const rows = products.map(p => headers.map(h => JSON.stringify(p[h] ?? '')).join(','));
  return [headers.join(','), ...rows].join('\n');
}
function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 5000);
}
