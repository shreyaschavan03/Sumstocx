// POST /user/settings
app.post("/user/settings", async (req, res) => {
  try {
    const { username, email, theme } = req.body;

    // Replace with your user auth logic
    const userId = req.user?.id; // if using JWT or session
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update settings
    user.username = username;
    user.email = email;
    user.theme = theme;
    await user.save();

    res.json({ message: "Settings saved successfully", theme });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save settings" });
  }
});
