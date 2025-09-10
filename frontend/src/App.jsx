import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ViewStocks from "./pages/ViewStocks.jsx";
import UpdateStock from "./pages/UpdateStock.jsx";
import AddProduct from "./pages/AddProduct.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-6 transition-all duration-500">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stocks" element={<ViewStocks />} />
          <Route path="/update" element={<UpdateStock />} />
          <Route path="/add" element={<AddProduct />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
