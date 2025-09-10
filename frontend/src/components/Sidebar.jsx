// components/Sidebar.jsx
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const links = [
    { name: "Dashboard", path: "/" },
    { name: "View Stocks", path: "/stocks" },
    { name: "Update Stock", path: "/update" },
    { name: "Add Product", path: "/add" },
    { name: "Reports", path: "/reports" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white fixed flex flex-col p-6">
      <h1 className="text-2xl font-bold mb-8">Inventory</h1>
      {links.map((link) => (
        <NavLink
          key={link.name}
          to={link.path}
          className={({ isActive }) =>
            `mb-4 px-4 py-2 rounded hover:bg-gray-700 ${
              isActive ? "bg-gray-700" : ""
            }`
          }
        >
          {link.name}
        </NavLink>
      ))}
    </div>
  );
}
