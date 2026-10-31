require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
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
app.use(session({
  name: "gc-admin.sid",
  secret: process.env.SESSION_SECRET || "development-only-change-this-secret",
  resave: false,
  saveUninitialized: false,
  store: process.env.MONGODB_URI ? MongoStore.create({ mongoUrl: process.env.MONGODB_URI }) : undefined,
  cookie: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 8 * 60 * 60 * 1000 }
}));

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
const requireAdmin = (req, res, next) => req.session.admin ? next() : res.redirect("/admin/login");

app.get("/", (req, res) => res.redirect("/admin"));
app.get("/admin/login", (req, res) => res.render("login", { error: null }));
app.post("/admin/login", loginLimiter, async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (email === String(process.env.ADMIN_EMAIL || "").toLowerCase() && password && password === process.env.ADMIN_PASSWORD) {
    req.session.admin = { email };
    return req.session.save(() => res.redirect("/admin"));
  }
  res.status(401).render("login", { error: "Email or password is incorrect." });
});
app.post("/admin/logout", requireAdmin, (req, res) => req.session.destroy(() => res.redirect("/admin/login")));

app.get("/admin", requireAdmin, async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: "Active" });
    res.render("dashboard", {
      adminEmail: req.session.admin.email,
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

app.get("/admin/employees", requireAdmin, async (req, res) => {
  const employees = await Employee.find().sort({ createdAt: -1 }).lean();
  res.render("employees", { employees, adminEmail: req.session.admin.email, notice: req.query.created ? "Employee added. Copy the temporary credentials shown at creation." : null });
});
app.post("/admin/employees", requireAdmin, async (req, res) => {
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
  res.render("employee-created", { employee: { employeeId, name, email, role }, temporaryPassword, adminEmail: req.session.admin.email });
});
app.post("/admin/employees/:id/status", requireAdmin, async (req, res) => {
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
