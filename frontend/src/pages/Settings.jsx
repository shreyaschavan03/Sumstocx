import { useState, useEffect } from "react";
import axios from "../api.js"; // your axios instance

export default function Settings() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(false);

  // Load existing settings (optional)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/user/settings");
        setUsername(res.data.username || "");
        setEmail(res.data.email || "");
        setTheme(res.data.theme || "light");
        applyTheme(res.data.theme || "light");
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    fetchSettings();
  }, []);

  // Apply theme
  const applyTheme = (theme) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/user/settings", {
        username,
        email,
        theme,
      });
      applyTheme(theme);
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Settings</h2>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-fadeIn space-y-4">
        <p className="font-semibold text-gray-800 dark:text-gray-200">Profile Settings</p>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200"
        />

        <div className="flex items-center justify-between mt-4 text-gray-800 dark:text-gray-200">
          <span>Theme:</span>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="p-2 border rounded-lg dark:bg-gray-700 dark:text-gray-200"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition duration-300 mt-4 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
