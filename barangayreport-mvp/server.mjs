import http from "node:http";
import { DatabaseSync } from "node:sqlite";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || join(root, "data", "barangay.sqlite");
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,name TEXT NOT NULL,mobile TEXT UNIQUE NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'resident',created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id),expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS reports(id INTEGER PRIMARY KEY,owner_id INTEGER NOT NULL REFERENCES users(id),client_key TEXT NOT NULL,category TEXT NOT NULL,description TEXT NOT NULL,address TEXT NOT NULL,lat REAL,lng REAL,anonymous INTEGER NOT NULL DEFAULT 0,photo BLOB,photo_type TEXT,status TEXT NOT NULL DEFAULT 'received',created_at TEXT NOT NULL,UNIQUE(owner_id,client_key));
CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY,report_id INTEGER NOT NULL REFERENCES reports(id),actor_id INTEGER NOT NULL REFERENCES users(id),status TEXT NOT NULL,note TEXT NOT NULL,created_at TEXT NOT NULL);`);
const now = () => new Date().toISOString();
const hash = (p) => {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(p, salt, 64).toString("hex");
};
const verify = (p, h) => {
  const [salt, key] = h.split(":");
  return timingSafeEqual(scryptSync(p, salt, 64), Buffer.from(key, "hex"));
};
const staffMobile = process.env.STAFF_MOBILE || "09990000001";
const staffPassword = process.env.STAFF_PASSWORD;
if (!db.prepare("SELECT id FROM users WHERE role=?").get("staff")) {
  if (!staffPassword || staffPassword.length < 12)
    throw new Error(
      "First start requires STAFF_PASSWORD of at least 12 characters. See README.",
    );
  db.prepare(
    "INSERT INTO users(name,mobile,password,role,created_at) VALUES(?,?,?,?,?)",
  ).run("Barangay staff", staffMobile, hash(staffPassword), "staff", now());
}
const categories = [
  "Uncollected garbage",
  "Road damage",
  "Flooding / drainage",
  "Streetlight issue",
  "Other concern",
];
const statuses = ["received", "in-progress", "resolved"];
const reference = (id) => "BR-" + String(id).padStart(6, "0");
const fail = (status, message, fields) =>
  Object.assign(new Error(message), { status, fields });
const safeUser = (u) => ({
  id: u.id,
  name: u.name,
  mobile: u.mobile,
  role: u.role,
});
function currentUser(req) {
  const token = /br_session=([a-f0-9]+)/.exec(req.headers.cookie || "")?.[1];
  return token
    ? db
        .prepare(
          "SELECT users.* FROM sessions JOIN users ON users.id=sessions.user_id WHERE token=? AND expires>?",
        )
        .get(token, Date.now())
    : null;
}
function requireUser(req) {
  const u = currentUser(req);
  if (!u) throw fail(401, "Please sign in to continue.");
  return u;
}
function reportFor(id, u) {
  const r = db
    .prepare(
      "SELECT reports.*,users.name AS owner_name,users.mobile AS owner_mobile FROM reports JOIN users ON users.id=reports.owner_id WHERE reports.id=?",
    )
    .get(id);
  if (!r || (u.role !== "staff" && r.owner_id !== u.id))
    throw fail(404, "Report not found.");
  return r;
}
function serialize(r, u, detail = false) {
  const out = {
    id: r.id,
    reference: reference(r.id),
    category: r.category,
    description: r.description,
    address: r.address,
    lat: r.lat,
    lng: r.lng,
    anonymous: !!r.anonymous,
    hasPhoto: !!r.photo,
    status: r.status,
    createdAt: r.created_at,
  };
  if (u.role === "staff")
    out.reporter = r.anonymous
      ? { name: "Identity withheld", mobile: null }
      : { name: r.owner_name, mobile: r.owner_mobile };
  if (detail)
    out.timeline = db
      .prepare(
        "SELECT status,note,created_at AS createdAt FROM events WHERE report_id=? ORDER BY id",
      )
      .all(r.id);
  return out;
}
async function readBody(req) {
  if (!(req.headers["content-type"] || "").startsWith("application/json"))
    throw fail(415, "Send application/json.");
  let size = 0,
    chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > 3_000_000)
      throw fail(
        413,
        "The photo or request is too large. Use a photo below 2 MB.",
      );
    chunks.push(c);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    throw fail(400, "Invalid JSON request.");
  }
}
const text = (s) => (typeof s === "string" ? s.trim() : "");
function authInput(b, register = false) {
  const mobile = text(b.mobile).replace(/[\s-]/g, ""),
    password = typeof b.password === "string" ? b.password : "",
    name = text(b.name);
  const fields = {};
  if (!/^\d{10,15}$/.test(mobile))
    fields.mobile = "Enter a mobile number with 10–15 digits.";
  if (password.length < (register ? 10 : 1) || password.length > 128)
    fields.password = register
      ? "Use 10–128 characters."
      : "Enter your password.";
  if (register && (name.length < 2 || name.length > 80))
    fields.name = "Enter a name with 2–80 characters.";
  if (Object.keys(fields).length)
    throw fail(400, "Check the highlighted fields.", fields);
  return { mobile, password, name };
}
const attempts = new Map();
function throttle(req) {
  const key = req.socket.remoteAddress,
    t = Date.now(),
    v = attempts.get(key);
  if (!v || v.until < t) {
    attempts.set(key, { count: 1, until: t + 900000 });
    return;
  }
  if (++v.count > 30)
    throw fail(429, "Too many sign-in attempts. Try again in 15 minutes.");
  if (attempts.size > 1000)
    for (const [k, v] of attempts) if (v.until < t) attempts.delete(k);
}
function setSession(res, u) {
  db.prepare("DELETE FROM sessions WHERE expires<?").run(Date.now());
  const token = randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions VALUES(?,?,?)").run(
    token,
    u.id,
    Date.now() + 8 * 3600000,
  );
  res.setHeader(
    "Set-Cookie",
    `br_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${process.env.COOKIE_SECURE === "1" ? "; Secure" : ""}`,
  );
}
function validateReport(b) {
  const fields = {};
  const category = text(b.category),
    description = text(b.description),
    address = text(b.address),
    key = text(b.clientKey);
  if (!categories.includes(category)) fields.category = "Choose a category.";
  if (description.length < 10 || description.length > 2000)
    fields.description = "Describe the concern in 10–2,000 characters.";
  if (address.length < 5 || address.length > 300)
    fields.address = "Add a location or landmark with 5–300 characters.";
  if (!/^[a-zA-Z0-9-]{8,80}$/.test(key))
    fields.form = "Invalid submission key. Reload and try again.";
  let lat = null,
    lng = null;
  if (b.lat != null || b.lng != null) {
    lat = b.lat;
    lng = b.lng;
    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      Math.abs(lat) > 90 ||
      Math.abs(lng) > 180
    )
      fields.address =
        "Choose a valid location, or clear GPS and enter a landmark.";
  }
  let photo = null,
    photoType = null;
  if (b.photo) {
    const m = /^data:(image\/(?:png|jpeg));base64,([A-Za-z0-9+/=]+)$/.exec(
      b.photo,
    );
    if (!m) fields.photo = "Use a JPG or PNG photo.";
    else {
      photoType = m[1];
      photo = Buffer.from(m[2], "base64");
      if (photo.length > 2_000_000) fields.photo = "Use a photo below 2 MB.";
      if (
        photo.length < 8 ||
        (photoType === "image/png"
          ? !photo
              .subarray(0, 8)
              .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          : photo[0] !== 255 || photo[1] !== 216 || photo[2] !== 255)
      )
        fields.photo = "This file is not a valid JPG or PNG.";
    }
  }
  if (typeof b.anonymous !== "boolean")
    fields.form = "Choose whether to withhold your identity.";
  if (Object.keys(fields).length)
    throw fail(400, "Check the highlighted fields.", fields);
  return {
    category,
    description,
    address,
    key,
    lat,
    lng,
    photo,
    photoType,
    anonymous: b.anonymous ? 1 : 0,
  };
}
function send(res, code, data) {
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
}
const server = http.createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  );
  try {
    const url = new URL(req.url, "http://localhost"),
      path = url.pathname;
    if (!["GET", "HEAD"].includes(req.method) && req.headers.origin) {
      const origin = new URL(req.headers.origin);
      if (origin.host !== req.headers.host)
        throw fail(403, "Cross-site requests are not allowed.");
    }
    if (path === "/api/health") return send(res, 200, { ok: true });
    if (path === "/api/me" && req.method === "GET") {
      const u = currentUser(req);
      return send(res, 200, { user: u ? safeUser(u) : null, categories });
    }
    if (path === "/api/register" && req.method === "POST") {
      throttle(req);
      const b = authInput(await readBody(req), true);
      if (db.prepare("SELECT id FROM users WHERE mobile=?").get(b.mobile))
        throw fail(409, "This mobile number already has an account.", {
          mobile: "Sign in or use a different number.",
        });
      const id = db
        .prepare(
          "INSERT INTO users(name,mobile,password,created_at) VALUES(?,?,?,?)",
        )
        .run(b.name, b.mobile, hash(b.password), now()).lastInsertRowid;
      const u = db.prepare("SELECT * FROM users WHERE id=?").get(id);
      setSession(res, u);
      return send(res, 201, { user: safeUser(u) });
    }
    if (path === "/api/login" && req.method === "POST") {
      throttle(req);
      const b = authInput(await readBody(req)),
        u = db.prepare("SELECT * FROM users WHERE mobile=?").get(b.mobile);
      if (!u || !verify(b.password, u.password))
        throw fail(401, "Mobile number or password is incorrect.");
      setSession(res, u);
      return send(res, 200, { user: safeUser(u) });
    }
    if (path === "/api/logout" && req.method === "POST") {
      const token = /br_session=([a-f0-9]+)/.exec(
        req.headers.cookie || "",
      )?.[1];
      if (token) db.prepare("DELETE FROM sessions WHERE token=?").run(token);
      res.setHeader(
        "Set-Cookie",
        "br_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
      );
      return send(res, 200, { ok: true });
    }
    if (path === "/api/reports" && req.method === "GET") {
      const u = requireUser(req);
      const reports =
        u.role === "staff"
          ? db
              .prepare(
                "SELECT reports.*,users.name AS owner_name,users.mobile AS owner_mobile FROM reports JOIN users ON users.id=reports.owner_id ORDER BY reports.id DESC",
              )
              .all()
          : db
              .prepare(
                "SELECT * FROM reports WHERE owner_id=? ORDER BY id DESC",
              )
              .all(u.id);
      return send(res, 200, { reports: reports.map((r) => serialize(r, u)) });
    }
    if (path === "/api/reports" && req.method === "POST") {
      const u = requireUser(req);
      if (u.role !== "resident")
        throw fail(403, "Use a resident account to submit a concern.");
      const b = validateReport(await readBody(req));
      const previous = db
        .prepare("SELECT * FROM reports WHERE owner_id=? AND client_key=?")
        .get(u.id, b.key);
      if (previous)
        return send(res, 200, { report: serialize(previous, u, true) });
      db.exec("BEGIN");
      try {
        const created = now();
        const id = db
          .prepare(
            "INSERT INTO reports(owner_id,client_key,category,description,address,lat,lng,anonymous,photo,photo_type,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
          )
          .run(
            u.id,
            b.key,
            b.category,
            b.description,
            b.address,
            b.lat,
            b.lng,
            b.anonymous,
            b.photo,
            b.photoType,
            created,
          ).lastInsertRowid;
        db.prepare(
          "INSERT INTO events(report_id,actor_id,status,note,created_at) VALUES(?,?,?,?,?)",
        ).run(
          id,
          u.id,
          "received",
          "Report received by the demo system. Awaiting staff review.",
          created,
        );
        db.exec("COMMIT");
        return send(res, 201, { report: serialize(reportFor(id, u), u, true) });
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    }
    const match = path.match(/^\/api\/reports\/(\d+)(?:\/(photo|status))?$/);
    if (match) {
      const u = requireUser(req),
        r = reportFor(Number(match[1]), u);
      if (match[2] === "photo" && req.method === "GET") {
        if (!r.photo) throw fail(404, "No photo attached.");
        res.writeHead(200, {
          "Content-Type": r.photo_type,
          "Cache-Control": "private, no-store",
        });
        return res.end(Buffer.from(r.photo));
      }
      if (match[2] === "status" && req.method === "PATCH") {
        if (u.role !== "staff")
          throw fail(403, "Only staff can update report status.");
        const b = await readBody(req),
          note = text(b.note);
        if (
          !statuses.includes(b.status) ||
          note.length < 5 ||
          note.length > 1000
        )
          throw fail(
            400,
            "Choose a valid status and add a 5–1,000 character update.",
          );
        if (b.status === r.status)
          throw fail(409, "This report already has that status.");
        db.exec("BEGIN");
        try {
          db.prepare("UPDATE reports SET status=? WHERE id=?").run(
            b.status,
            r.id,
          );
          db.prepare(
            "INSERT INTO events(report_id,actor_id,status,note,created_at) VALUES(?,?,?,?,?)",
          ).run(r.id, u.id, b.status, note, now());
          db.exec("COMMIT");
        } catch (e) {
          db.exec("ROLLBACK");
          throw e;
        }
        return send(res, 200, {
          report: serialize(reportFor(r.id, u), u, true),
        });
      }
      if (!match[2] && req.method === "GET")
        return send(res, 200, { report: serialize(r, u, true) });
    }
    if (path.startsWith("/api/")) throw fail(404, "Endpoint not found.");
    const files = {
      "/": "index.html",
      "/app.js": "app.js",
      "/style.css": "style.css",
      "/favicon.svg": "favicon.svg",
    };
    if (!files[path] || !["GET", "HEAD"].includes(req.method))
      throw fail(404, "Page not found.");
    const file = join(root, "public", files[path]);
    const types = {
      html: "text/html",
      js: "text/javascript",
      css: "text/css",
      svg: "image/svg+xml",
    };
    res.writeHead(200, {
      "Content-Type": types[file.split(".").pop()] + "; charset=utf-8",
      "Cache-Control": "no-cache",
    });
    res.end(req.method === "HEAD" ? undefined : readFileSync(file));
  } catch (e) {
    if (!e.status) console.error(e);
    if (!res.headersSent)
      send(res, e.status || 500, {
        error: e.status
          ? e.message
          : "An unexpected error occurred. Please try again.",
        fields: e.fields || {},
      });
    else res.end();
  }
});
server.listen(
  Number(process.env.PORT || 3300),
  process.env.HOST || "127.0.0.1",
  () =>
    console.log(
      `BarangayReport ready at http://${process.env.HOST || "127.0.0.1"}:${process.env.PORT || 3300}`,
    ),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () =>
    server.close(() => {
      db.close();
      process.exit(0);
    }),
  );
