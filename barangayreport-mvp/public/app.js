const $ = (s) => document.querySelector(s);
const escape = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const icons = {
  home: "M3 10 12 3l9 7v10H3z M9 20v-7h6v7",
  reports: "M6 3h12v18H6z M9 8h6 M9 12h6 M9 16h4",
  plus: "M12 5v14 M5 12h14",
  help: "M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4 M12 17h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  pin: "M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0 M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  check: "M5 12l5 5L20 7",
  arrow: "M5 12h14 M13 6l6 6-6 6",
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[name] || icons.reports}"/></svg>`;
const labels = {
  received: "Received",
  "in-progress": "In progress",
  resolved: "Resolved",
};
const date = (s) =>
  new Date(s).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
const state = {
  user: null,
  categories: [],
  reports: [],
  draft: null,
  detail: null,
  success: null,
  authMode: "login",
  filter: "all",
  query: "",
  ready: false,
};
let routeVersion = 0;
function freshDraft() {
  return {
    category: "",
    description: "",
    address: "",
    lat: null,
    lng: null,
    photo: null,
    anonymous: false,
    clientKey: crypto.randomUUID(),
  };
}
async function api(path, options = {}) {
  let response;
  try {
    response = await fetch("/api" + path, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error(
      "Cannot connect. Check your connection and try again. Your form has not been cleared.",
    );
  }
  const result = await response.json();
  if (!response.ok)
    throw Object.assign(new Error(result.error), {
      fields: result.fields,
      status: response.status,
    });
  return result;
}
function toast(text) {
  $("#toast").textContent = text;
  setTimeout(() => ($("#toast").textContent = ""), 3800);
}
function showError(e) {
  const box = $("#formError");
  if (box) {
    box.textContent = e.message;
    box.focus();
  } else toast(e.message);
  document
    .querySelectorAll("[data-error]")
    .forEach((x) => (x.textContent = ""));
  document
    .querySelectorAll("[aria-invalid]")
    .forEach((x) => x.removeAttribute("aria-invalid"));
  for (const [k, v] of Object.entries(e.fields || {})) {
    const error = document.querySelector(`[data-error="${k}"]`),
      input = document.querySelector(`[name="${k}"]`);
    if (error) error.textContent = v;
    if (input) input.setAttribute("aria-invalid", "true");
  }
  const first = document.querySelector("[aria-invalid=true]");
  if (first) first.focus();
}
const errorBox = () => '<div id="formError" role="alert" tabindex="-1"></div>';
const badge = (status) =>
  `<span class="badge ${status}">${labels[status]}</span>`;
function field(name, label, control, hint = "") {
  return `<div class="field"><label for="${name}">${label}</label>${control}<p class="hint" id="${name}-hint">${hint}</p><div class="error" data-error="${name}" id="${name}-error"></div></div>`;
}
const input = (name, type = "text", value = "", extra = "") =>
  `<input id="${name}" name="${name}" type="${type}" value="${escape(value)}" aria-describedby="${name}-hint ${name}-error" ${extra}>`;
function nav(route, mobile = false) {
  const items =
    state.user?.role === "staff"
      ? [
          ["reports", "reports", "Report queue"],
          ["help", "help", "Help"],
        ]
      : [
          ["home", "home", "Home"],
          ["reports", "reports", "My reports"],
          ["new", "plus", "New report"],
          ["help", "help", "Help"],
        ];
  return items
    .map(
      ([target, i, label]) =>
        `<a href="#${target}" class="${mobile ? "" : "navlink "}${route === target || (target === "reports" && route.startsWith("report/")) ? "active" : ""}" ${route === target ? 'aria-current="page"' : ""}>${icon(i)}${label}</a>`,
    )
    .join("");
}
function shell(content, route = "home") {
  const u = state.user;
  $("#app").innerHTML =
    `<header class="topbar"><a class="brand" href="#${u?.role === "staff" ? "reports" : "home"}"><img src="/favicon.svg" alt=""><span>BarangayReport<small>LOCAL CONCERNS, CLEAR UPDATES</small></span></a><div class="top-actions"><span class="tag">CLASSROOM MVP</span>${u ? '<button class="link-button" data-action="logout">Sign out</button>' : ""}</div></header>${!navigator.onLine ? '<div class="offline-status" role="status">You are offline. Submissions and updates need a connection.</div>' : ""}${u ? `<div class="layout"><aside class="sidebar"><div class="profile"><span class="eyebrow">${u.role === "staff" ? "Staff workspace" : "Resident workspace"}</span><p>${escape(u.name)}</p></div><nav aria-label="Main navigation">${nav(route)}</nav><div class="sidebar-note">A classroom prototype.<br>Reports are not sent to a real barangay office.</div></aside><main id="main">${content}</main></div><nav class="mobile-nav" aria-label="Mobile navigation">${nav(route, true)}</nav>` : `<main id="main" class="auth">${content}</main>`}`;
}
function auth() {
  const reg = state.authMode === "register";
  shell(
    `<section class="auth-story"><span class="eyebrow">Your community, connected</span><h1>Small reports.<br>Better places<br>to call home.</h1><p>Report a local concern, keep your reference number, and follow the progress in one place.</p><div class="auth-steps"><div class="auth-step"><b>1</b> Tell us what happened</div><div class="auth-step"><b>2</b> Review and submit your report</div><div class="auth-step"><b>3</b> Track updates from staff</div></div><p class="small">Classroom demonstration only. Use fictional details when trying this prototype.</p></section><section class="auth-form"><div class="auth-tabs"><button class="${reg ? "" : "active"}" data-action="auth-mode" data-mode="login">Sign in</button><button class="${reg ? "active" : ""}" data-action="auth-mode" data-mode="register">Create account</button></div><h2>${reg ? "Join your community" : "Welcome back"}</h2><p class="intro">${reg ? "Create a resident account to submit and track reports." : "Sign in to access your reports and latest updates."}</p><form id="authForm" novalidate>${errorBox()}${reg ? field("name", "Full name", input("name", "text", "", 'autocomplete="name" maxlength="80"')) : ""}${field("mobile", "Mobile number", input("mobile", "tel", "", 'autocomplete="tel" inputmode="tel" placeholder="09XXXXXXXXX" maxlength="20"'), "Use 10–15 digits. No OTP is sent in this MVP.")}${field("password", "Password", input("password", "password", "", `autocomplete="${reg ? "new-password" : "current-password"}" maxlength="128"`), reg ? "At least 10 characters." : "")}<button class="btn wide" type="submit">${reg ? "Create account" : "Sign in"} ${icon("arrow")}</button></form><p class="small muted">This is a classroom MVP, not an emergency service. For immediate danger, contact local emergency services directly.</p></section>`,
  );
}
function reportCard(r) {
  return `<a class="card report-card" href="#report/${r.id}"><div class="report-head"><div class="report-title"><span class="report-icon">${icon("reports")}</span><div><h3>${escape(r.category)}</h3><span class="reference">${r.reference}</span></div></div>${badge(r.status)}</div><p>${escape(r.description.length > 140 ? r.description.slice(0, 140) + "…" : r.description)}</p><div class="report-meta"><span>${escape(r.address)}</span><span>${new Date(r.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</span></div></a>`;
}
function stats() {
  return `<div class="stats"><div class="stat"><strong>${state.reports.length}</strong><span>Total reports</span></div><div class="stat"><strong>${state.reports.filter((r) => r.status === "in-progress").length}</strong><span>In progress</span></div><div class="stat"><strong>${state.reports.filter((r) => r.status === "resolved").length}</strong><span>Resolved</span></div></div>`;
}
function home() {
  shell(
    `<span class="eyebrow">Resident dashboard</span><h1>Hello, ${escape(state.user.name.split(" ")[0])}.</h1><p class="intro">Your concerns matter. Keep track of what happens next.</p><section class="hero"><span class="eyebrow">Make your voice count</span><h2>See a concern in your area?</h2><p>Share the details with staff. Add a clear location, review your report, and follow its progress.</p><a class="btn" href="#new">${icon("plus")} Report an incident</a></section>${stats()}<div class="section-head"><h2>Recent reports</h2><a href="#reports">View all →</a></div>${state.reports.length ? state.reports.slice(0, 3).map(reportCard).join("") : `<div class="card empty">${icon("reports")}<h3>No reports yet</h3><p>Your submitted reports and their updates will appear here.</p></div>`}<div class="notice">For immediate danger, contact local emergency services. This classroom prototype does not dispatch assistance.</div>`,
    "home",
  );
}
function steps(current) {
  return `<div class="stepper" aria-label="Step ${current} of 3"><span class="${current === 1 ? "active" : ""}"><b>1</b> Details</span><i></i><span class="${current === 2 ? "active" : ""}"><b>2</b> Review</span><i></i><span class="${current === 3 ? "active" : ""}"><b>3</b> Submitted</span></div>`;
}
function newReport() {
  state.draft ??= freshDraft();
  const d = state.draft;
  shell(
    `<a href="#home" class="back">← Back to home</a><h1>New report</h1><p class="intro">Tell us what happened and where staff can find the concern.</p>${steps(1)}<div class="form-grid"><form id="reportForm" class="card" novalidate>${errorBox()}${field("category", "Category <small>Required</small>", `<select id="category" name="category" aria-describedby="category-error"><option value="">Choose a category</option>${state.categories.map((c) => `<option ${d.category === c ? "selected" : ""}>${escape(c)}</option>`).join("")}</select>`)}${field("description", "Description <small>Required</small>", `<textarea id="description" name="description" maxlength="2000" aria-describedby="description-hint description-error" placeholder="Describe the concern and any useful details.">${escape(d.description)}</textarea>`, "10–2,000 characters. Avoid including other people’s private information.")}${field("photo", "Photo <small>Optional</small>", `<input type="file" id="photo" name="photo" accept="image/jpeg,image/png" aria-describedby="photo-hint photo-error"><div id="photoPreview">${d.photo ? `<img src="${d.photo}" alt="Selected report photo" class="photo-preview"><button type="button" class="link-button" data-action="clear-photo">Remove photo</button>` : ""}</div>`, "JPG or PNG, up to 2 MB. Use a clear photo of the concern.")}<div class="field"><label for="address">Location or landmark <small>Required</small></label><div class="actions"><button type="button" class="btn soft" data-action="gps">${icon("pin")} Use my location</button><button type="button" class="link-button" data-action="clear-gps">Clear GPS</button></div><p id="gpsInfo" class="hint">${d.lat !== null ? `GPS attached: ${d.lat.toFixed(5)}, ${d.lng.toFixed(5)}` : "GPS is optional. You can always enter a location manually."}</p>${input("address", "text", d.address, 'placeholder="Street, sitio, or nearby landmark" maxlength="300"')}<p id="address-hint" class="hint">Add a recognizable location even when GPS is attached.</p><div class="error" id="address-error" data-error="address"></div></div><div class="field"><label class="check"><input type="checkbox" name="anonymous" ${d.anonymous ? "checked" : ""}><span>Withhold my identity from staff<small>Your name and mobile number will not be shown in the staff view. Your account remains linked internally so you can track the report.</small></span></label></div><button type="submit" class="btn wide">Review report ${icon("arrow")}</button></form><aside class="card form-help"><h3>A useful report includes</h3><ul class="help-list"><li>A specific description of the concern.</li><li>A street, landmark, or other recognizable location.</li><li>A clear photo, if it is safe to take one.</li></ul><div class="notice">Do not put yourself at risk to collect evidence.</div><p class="small muted">You can edit all details before submitting. A draft is kept while navigating this page, but refreshing clears an unsubmitted draft.</p></aside></div>`,
    "new",
  );
}
function draftDetails(d) {
  return `<dl class="details"><dt>Category</dt><dd>${escape(d.category)}</dd><dt>Description</dt><dd>${escape(d.description)}</dd><dt>Location</dt><dd>${escape(d.address)}${d.lat != null ? `<br>GPS: ${d.lat.toFixed(5)}, ${d.lng.toFixed(5)}` : ""}</dd><dt>Reporter identity</dt><dd>${d.anonymous ? "Withheld from the staff view" : "Visible to barangay staff"}</dd></dl>`;
}
function review() {
  if (!state.draft) {
    location.hash = "new";
    return;
  }
  const d = state.draft;
  shell(
    `<a href="#new" class="back">← Edit report</a><h1>Review your report</h1><p class="intro">Check the details before sending them to the demo staff workspace.</p>${steps(2)}<div class="form-grid"><section class="card">${errorBox()}${draftDetails(d)}${d.photo ? `<h3>Attached photo</h3><img src="${d.photo}" class="detail-photo" alt="Photo attached to this report">` : ""}<p class="notice info">You can edit these details now. After submission, report content cannot be changed in this MVP.</p><div class="actions"><button class="btn" data-action="submit-report">Submit report ${icon("arrow")}</button><a href="#new" class="btn secondary">Edit details</a></div></section><aside class="card form-help"><h3>What happens next?</h3><p class="small muted">You receive a reference number. Staff can review the report and post updates, which appear in My reports.</p></aside></div>`,
    "new",
  );
}
function success() {
  const r = state.success;
  if (!r) {
    location.hash = "reports";
    return;
  }
  shell(
    `<section class="success"><div class="checkmark">${icon("check")}</div><h1>Report submitted!</h1><p class="intro">Your report has been saved. Keep your reference number to find it again.</p><div class="reference-box"><span class="eyebrow">Your reference number</span><strong>${r.reference}</strong>${badge(r.status)}</div><p class="small muted">Saved in this classroom demo. No real barangay office has been contacted.</p><a href="#report/${r.id}" class="btn wide">Track this report ${icon("arrow")}</a><a href="#home" class="link-button back">Return to home</a></section>`,
    "reports",
  );
}
function filtered() {
  const q = state.query.toLowerCase();
  return state.reports.filter(
    (r) =>
      (state.filter === "all" || r.status === state.filter) &&
      (!q ||
        `${r.reference} ${r.category} ${r.address} ${r.description}`
          .toLowerCase()
          .includes(q)),
  );
}
function results() {
  const rows = filtered();
  $("#reportList").innerHTML = rows.length
    ? rows.map(reportCard).join("")
    : '<div class="card empty"><h3>No matching reports</h3><p>Try a different search or status filter.</p></div>';
  $("#resultCount").textContent =
    `${rows.length} ${rows.length === 1 ? "report" : "reports"}`;
}
function reports() {
  const staff = state.user.role === "staff";
  shell(
    `<span class="eyebrow">${staff ? "Staff workspace" : "Your activity"}</span><div class="section-head"><div><h1>${staff ? "Report queue" : "My reports"}</h1><p class="intro">${staff ? "Review concerns, add updates, and keep residents informed." : "Follow each concern from submission to resolution."}</p></div>${!staff ? '<a class="btn" href="#new">+ New report</a>' : ""}</div>${stats()}<div class="filters" aria-label="Filter reports">${["all", ...Object.keys(labels)].map((v) => `<button class="filter ${state.filter === v ? "active" : ""}" data-action="filter" data-filter="${v}" aria-pressed="${state.filter === v}">${v === "all" ? "All reports" : labels[v]}</button>`).join("")}</div><div class="search-row"><label class="eyebrow" for="reportSearch">Search reports</label><input id="reportSearch" type="search" placeholder="Reference number, category, or location" value="${escape(state.query)}"></div><div class="section-head"><span class="report-count" id="resultCount"></span><button class="link-button" data-action="refresh">Refresh updates ↻</button></div><div id="reportList"></div>`,
    "reports",
  );
  results();
}
function detail(r) {
  const staff = state.user.role === "staff";
  shell(
    `<a class="back" href="#reports">← ${staff ? "Back to report queue" : "Back to my reports"}</a><div class="section-head"><div><span class="eyebrow">${r.reference}</span><h1>${escape(r.category)}</h1></div>${badge(r.status)}</div><p class="intro">Submitted ${date(r.createdAt)}</p><div class="detail-columns"><section><div class="card"><h2>Report details</h2>${draftDetails(r)}${staff ? `<dl class="details"><dt>Reporter</dt><dd>${escape(r.reporter.name)}${r.reporter.mobile ? `<br>${escape(r.reporter.mobile)}` : ""}</dd></dl>` : ""}</div>${r.hasPhoto ? `<section class="card"><h2>Attached photo</h2><img class="detail-photo" src="/api/reports/${r.id}/photo" alt="Photo submitted with report ${r.reference}"></section>` : ""}</section><section><div class="card"><div class="section-head"><h2>Progress timeline</h2><button class="link-button" data-action="refresh">↻ Refresh</button></div><ol class="timeline">${r.timeline.map((e) => `<li><strong>${labels[e.status]}</strong><p>${escape(e.note)}</p><time datetime="${e.createdAt}">${date(e.createdAt)}</time></li>`).join("")}</ol></div>${
      staff
        ? `<form id="statusForm" class="card" novalidate><h2>Post an update</h2>${errorBox()}${field(
            "status",
            "New status",
            `<select id="status" name="status">${Object.entries(labels)
              .map(
                ([v, l]) =>
                  `<option value="${v}" ${v === r.status ? "disabled" : ""} ${v === "in-progress" && r.status === "received" ? "selected" : ""}>${l}${v === r.status ? " (current)" : ""}</option>`,
              )
              .join("")}</select>`,
          )}${field("note", "Update for the resident", `<textarea id="note" name="note" maxlength="1000" placeholder="Explain the progress or action taken."></textarea>`, "5–1,000 characters. This note will be visible to the resident.")}<button class="btn wide" type="submit">Save status update</button></form>`
        : '<div class="notice info">Status updates appear when staff record an action. Use Refresh to check for new information.</div>'
    }</section></div>`,
    "report/" + r.id,
  );
}
function help() {
  shell(
    `<span class="eyebrow">Good to know</span><h1>Reporting, made clear.</h1><p class="intro">A few answers before you get started.</p><section class="card"><h2>What can I report?</h2><p class="small">Use this prototype for concerns such as uncollected garbage, road damage, flooding or drainage, and streetlight issues.</p><h2>Is this connected to a barangay office?</h2><p class="small">No. This is a classroom MVP. Reports stay on the demonstration server and are updated through its staff workspace.</p><h2>What does anonymous mean here?</h2><p class="small">The staff interface hides your name and mobile number. Your account remains linked to the report internally for access control. Do not include identifying details in the description or photo if you want to withhold them.</p><h2>What happens to my photo?</h2><p class="small">The photo is stored on the demo server and is available to you and authorized staff. Use fictional or non-sensitive demo photos. Photo metadata is not automatically removed in this MVP.</p><h2>How do I get updates?</h2><p class="small">Open My reports and select your reference number. The timeline shows updates recorded by staff. Refresh to retrieve the latest status. SMS and push notifications are not included.</p><h2>Can I edit a submitted report?</h2><p class="small">You can edit before submitting. Editing or deleting a submitted report and password recovery are not available in this MVP.</p></section><div class="notice">For urgent help, contact local emergency services directly. Do not rely on this classroom demonstration.</div>`,
    "help",
  );
}
async function route() {
  const v = ++routeVersion;
  if (!state.ready) return;
  if (!state.user) return auth();
  let r = location.hash.slice(1) || "home";
  if (
    state.user.role === "staff" &&
    ["home", "new", "review", "success"].includes(r)
  ) {
    location.hash = "reports";
    return;
  }
  try {
    if (["home", "reports"].includes(r)) {
      const data = await api("/reports");
      if (v !== routeVersion) return;
      state.reports = data.reports;
      if (r === "home") home();
      else reports();
    } else if (r === "new") newReport();
    else if (r === "review") review();
    else if (r === "success") success();
    else if (r === "help") help();
    else if (/^report\/\d+$/.test(r)) {
      const data = await api("/reports/" + r.split("/")[1]);
      if (v !== routeVersion) return;
      state.detail = data.report;
      detail(data.report);
    } else {
      location.hash = "home";
      return;
    }
    window.scrollTo(0, 0);
  } catch (e) {
    if (e.status === 401) {
      state.user = null;
      auth();
      showError(e);
    } else
      shell(
        `<h1>Unable to load this page</h1><div class="notice">${escape(e.message)}</div><button class="btn" data-action="refresh">Try again</button><a class="link-button" href="#reports">Back to reports</a>`,
        r,
      );
  }
}
function syncDraft() {
  const form = $("#reportForm");
  if (form) {
    const data = new FormData(form);
    Object.assign(state.draft, {
      category: data.get("category"),
      description: data.get("description"),
      address: data.get("address"),
      anonymous: data.has("anonymous"),
    });
  }
}
function validateDraft() {
  const d = state.draft,
    fields = {};
  if (!d.category) fields.category = "Choose a category.";
  if (d.description.trim().length < 10)
    fields.description =
      "Add at least 10 characters so staff understand the concern.";
  if (d.address.trim().length < 5)
    fields.address = "Enter a location or landmark with at least 5 characters.";
  if (Object.keys(fields).length)
    throw Object.assign(
      new Error("Check the highlighted fields before continuing."),
      { fields },
    );
}
async function busy(button, work) {
  if (button?.disabled) return;
  if (button) button.disabled = true;
  try {
    await work();
  } catch (e) {
    showError(e);
  } finally {
    if (button) button.disabled = false;
  }
}
document.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target,
    button = form.querySelector("button[type=submit]");
  busy(button, async () => {
    if (form.id === "authForm") {
      const data = Object.fromEntries(new FormData(form));
      const result = await api("/" + state.authMode, {
        method: "POST",
        body: data,
      });
      state.user = result.user;
      location.hash = state.user.role === "staff" ? "reports" : "home";
      await route();
    } else if (form.id === "reportForm") {
      syncDraft();
      validateDraft();
      location.hash = "review";
    } else if (form.id === "statusForm") {
      const data = Object.fromEntries(new FormData(form));
      await api("/reports/" + state.detail.id + "/status", {
        method: "PATCH",
        body: data,
      });
      await route();
      toast("Status update saved.");
    }
  });
});
document.addEventListener("input", (e) => {
  if (e.target.closest("#reportForm")) syncDraft();
  if (e.target.id === "reportSearch") {
    state.query = e.target.value;
    results();
  }
});
document.addEventListener("change", async (e) => {
  if (e.target.id !== "photo") return;
  const file = e.target.files[0];
  if (!file) return;
  syncDraft();
  try {
    if (
      !["image/png", "image/jpeg"].includes(file.type) ||
      file.size > 2_000_000
    )
      throw Object.assign(new Error("Choose a JPG or PNG photo below 2 MB."), {
        fields: { photo: "This photo is not supported." },
      });
    state.draft.photo = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    $("#photoPreview").innerHTML =
      `<img src="${state.draft.photo}" class="photo-preview" alt="Selected report photo"><button type="button" class="link-button" data-action="clear-photo">Remove photo</button>`;
    $("[data-error=photo]").textContent = "";
  } catch (error) {
    e.target.value = "";
    showError(error);
  }
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const action = b.dataset.action;
  if (action === "auth-mode") {
    state.authMode = b.dataset.mode;
    auth();
    return;
  }
  if (action === "filter") {
    state.filter = b.dataset.filter;
    document.querySelectorAll(".filter").forEach((x) => {
      x.classList.toggle("active", x === b);
      x.setAttribute("aria-pressed", String(x === b));
    });
    results();
    return;
  }
  if (action === "clear-photo") {
    syncDraft();
    state.draft.photo = null;
    $("#photo").value = "";
    $("#photoPreview").innerHTML = "";
    return;
  }
  if (action === "clear-gps") {
    syncDraft();
    state.draft.lat = state.draft.lng = null;
    $("#gpsInfo").textContent =
      "GPS cleared. Enter a location or landmark below.";
    return;
  }
  if (action === "gps") {
    syncDraft();
    if (!navigator.geolocation) {
      $("#gpsInfo").textContent =
        "GPS is unavailable. Enter a location manually.";
      return;
    }
    b.disabled = true;
    $("#gpsInfo").textContent = "Requesting your location…";
    navigator.geolocation.getCurrentPosition(
      (p) => {
        state.draft.lat = p.coords.latitude;
        state.draft.lng = p.coords.longitude;
        const info = $("#gpsInfo");
        if (info)
          info.textContent = `GPS attached: ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`;
        b.disabled = false;
      },
      () => {
        const info = $("#gpsInfo");
        if (info)
          info.textContent =
            "Location unavailable or permission denied. Enter a location or landmark manually.";
        b.disabled = false;
      },
      { timeout: 10000, maximumAge: 30000 },
    );
    return;
  }
  busy(b, async () => {
    if (action === "logout") {
      await api("/logout", { method: "POST", body: {} });
      state.user = null;
      state.authMode = "login";
      state.draft = null;
      state.reports = [];
      state.detail = null;
      state.success = null;
      location.hash = "home";
      auth();
    } else if (action === "refresh") await route();
    else if (action === "submit-report") {
      const data = await api("/reports", { method: "POST", body: state.draft });
      state.success = data.report;
      state.draft = null;
      location.hash = "success";
    }
  });
});
window.addEventListener("hashchange", route);
window.addEventListener("online", () =>
  toast("Connection restored. You can try again."),
);
window.addEventListener("offline", () =>
  toast("You are offline. Your current form has not been cleared."),
);
(async () => {
  try {
    const data = await api("/me");
    state.user = data.user;
    state.categories = data.categories;
    state.ready = true;
    route();
  } catch (e) {
    $("#app").innerHTML =
      `<main><h1>Unable to connect</h1><p>${escape(e.message)}</p><a href="/">Reload</a></main>`;
  }
})();
