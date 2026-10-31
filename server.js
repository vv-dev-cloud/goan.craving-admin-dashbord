require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const bcrypt = require("bcryptjs");
const path = require("path");
const Employee = require("./models/Employee");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => res.redirect("/admin"));
app.get("/admin/login", (req, res) => res.redirect("/admin"));

const adminPages = {
  orders: { title: "Orders", subtitle: "Review incoming orders and follow fulfillment progress.", icon: "▤", cards: ["All orders", "New orders", "Preparing", "Completed"], note: "Connect this page to the Goan Craving orders collection to show live order records and status controls." },
  customers: { title: "Customers", subtitle: "Customer profiles, contact details, and order history.", icon: "♙", cards: ["Customer directory", "New customers", "Returning customers", "Customer support"], note: "Connect this page to the customer and order collections for live profiles and history." },
  analytics: { title: "Analytics & reports", subtitle: "Track store performance across your selected date range.", icon: "▥", cards: ["Revenue trends", "Order volume", "Average order value", "Customer growth"], note: "Analytics currently uses placeholder dashboard figures. Live reporting needs the order and payment data sources." },
  reports: { title: "Reports", subtitle: "Prepare and export operational summaries.", icon: "▧", cards: ["Sales report", "Order report", "Employee report", "Customer report"], note: "Report exports will be enabled after the corresponding live data sources are connected." },
  activity: { title: "Employee activity", subtitle: "Monitor staff access and recent activity.", icon: "◷", cards: ["Last active", "Sign-in history", "Role overview", "Account status"], note: "Employee last-active timestamps are stored. Full sign-in history requires an audit log." },
  settings: { title: "Settings", subtitle: "Manage dashboard preferences and store configuration.", icon: "⚙", cards: ["Admin profile", "Store details", "Notifications", "Security"], note: "Security and store settings should be connected to persistent configuration before editing is enabled." }
};
app.get("/admin/:section(orders|customers|analytics|reports|activity|settings)", (req, res) => {
  const page = adminPages[req.params.section];
  res.render("workspace-page", { page, active: req.params.section, totalEmployees: 0, activeEmployees: 0 });
});

app.get("/admin", async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: "Active" });
    res.render("dashboard", {
      metrics: { revenue: 24850, orders: 184, customers: 1286, averageOrder: 135 },
      orderStatuses: [{ label: "Delivered", count: 118, percent: 64, tone: "green" }, { label: "Preparing", count: 32, percent: 18, tone: "amber" }, { label: "On the way", count: 24, percent: 13, tone: "blue" }, { label: "Cancelled", count: 10, percent: 6, tone: "red" }],
      recentOrders: [
        { id: "GC-1084", customer: "Riya Naik", amount: 420, status: "Delivered" },
        { id: "GC-1083", customer: "Rahul Dessai", amount: 285, status: "Preparing" },
        { id: "GC-1082", customer: "Meera K.", amount: 560, status: "Delivered" },
        { id: "GC-1081", customer: "Arjun P.", amount: 190, status: "On the way" }
      ],
      totalEmployees, activeEmployees
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Could not load dashboard.");
  }
});

app.get("/admin/employees", async (req, res) => {
  const employees = await Employee.find().sort({ createdAt: -1 }).lean();
  res.render("employees", { employees, adminEmail: "Admin", notice: req.query.created ? "Employee added. Copy the temporary credentials shown at creation." : null });
});
app.post("/admin/employees", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const role = String(req.body.role || "Order manager");
  if (!name || !email) return res.status(400).send("Name and email are required.");
  if (!["Order manager", "Kitchen staff", "Delivery coordinator"].includes(role)) return res.status(400).send("Invalid role.");
  const exists = await Employee.findOne({ email });
  if (exists) return res.status(409).send("An employee with this email already exists.");
  const employeeId = "GCEMP-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const temporaryPassword = require("crypto").randomBytes(5).toString("hex");
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);
  await Employee.create({ employeeId, name, email, role, passwordHash, mustChangePassword: true });
  res.render("employee-created", { employee: { employeeId, name, email, role }, temporaryPassword, adminEmail: "Admin" });
});
app.post("/admin/employees/:id/status", async (req, res) => {
  const status = req.body.status === "Inactive" ? "Inactive" : "Active";
  await Employee.findByIdAndUpdate(req.params.id, { status });
  res.redirect("/admin/employees");
});

app.get("/health", (req, res) => res.json({ status: "ok" }));
async function start() {
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } else {
    console.warn("MONGODB_URI is missing. Dashboard starts without database-backed employee features.");
  }
  app.listen(PORT, () => console.log("Goan Craving Admin running on port " + PORT));
}
start().catch(err => { console.error("Startup failed:", err); process.exit(1); });
