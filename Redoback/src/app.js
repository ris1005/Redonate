const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const donorRoutes = require("./routes/donor.routes");
const receiverRoutes = require("./routes/receiver.routes");
const agentRoutes = require("./routes/agent.routes");
const adminRoutes = require("./routes/admin.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

app.use(cors({
  origin: "https://redonate.vercel.app",
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/donor", donorRoutes);
app.use("/api/receiver", receiverRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("ReDonate API running");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

module.exports = app;
