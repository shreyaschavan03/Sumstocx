import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../services/api";

export default function Settings() {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState({
    full_name: "",
    company_name: "",
    email: "",
    phone: "",
    theme: "light",
    notifications: true,
    low_stock_alerts: true,
    auto_backup: false,
    language: "en"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    try {
      // Set basic user info from auth context
      setSettings(prev => ({
        ...prev,
        email: user?.email || "",
        full_name: user?.user_metadata?.full_name || "",
        company_name: user?.user_metadata?.company_name || ""
      }));

      // Try to load additional settings from backend
      try {
        const profileData = await authAPI.getProfile();
        if (profileData.user) {
          setSettings(prev => ({
            ...prev,
            ...profileData.user
          }));
        }
      } catch (error) {
        console.log("Could not load additional profile data:", error.message);
      }

    } catch (error) {
      console.error("Error loading user settings:", error);
    }
  };

  // Apply theme immediately
  const applyTheme = (theme) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));

    // Apply theme immediately when changed
    if (field === "theme") {
      applyTheme(value);
    }
  };

  const handleSave = async () => {
    if (!settings.full_name || !settings.email) {
      setMessage("Please fill in required fields!");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // Save settings to backend
      await authAPI.updateProfile({
        full_name: settings.full_name,
        company_name: settings.company_name,
        email: settings.email,
        phone: settings.phone,
        theme: settings.theme
      });

      setMessage("Settings saved successfully!");
      
      // Reload settings to get updated data
      setTimeout(() => loadUserSettings(), 1000);

    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      full_name: user?.user_metadata?.full_name || "",
      company_name: user?.user_metadata?.company_name || "",
      email: user?.email || "",
      phone: "",
      theme: "light",
      notifications: true,
      low_stock_alerts: true,
      auto_backup: false,
      language: "en"
    });
    applyTheme("light");
    setMessage("");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Apply theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    handleChange("theme", savedTheme);
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-400">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account preferences and application settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "profile", name: "Profile" },
              { id: "preferences", name: "Preferences" },
              { id: "notifications", name: "Notifications" },
              { id: "account", name: "Account" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('successfully') 
                ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900 dark:text-green-300' 
                : 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900 dark:text-red-300'
            }`}>
              {message}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Profile Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={settings.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={settings.company_name}
                    onChange={(e) => handleChange("company_name", e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Application Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleChange("theme", e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Auto Backup
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Automatically backup your data daily
                    </p>
                  </div>
                  <button
                    onClick={() => handleChange("auto_backup", !settings.auto_backup)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.auto_backup ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.auto_backup ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notification Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Notifications
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive email updates about your inventory
                    </p>
                  </div>
                  <button
                    onClick={() => handleChange("notifications", !settings.notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Low Stock Alerts
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get notified when stock levels are low
                    </p>
                  </div>
                  <button
                    onClick={() => handleChange("low_stock_alerts", !settings.low_stock_alerts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.low_stock_alerts ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.low_stock_alerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Account Management</h3>
              
              <div className="space-y-4">
                <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900 dark:border-yellow-800 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Danger Zone</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    These actions are irreversible. Please proceed with caution.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300"
                  >
                    Reset to Defaults
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition duration-300 font-semibold"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Required Fields Note */}
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
        * indicates required fields
      </div>
    </div>
  );
}