const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.BROWSER_BIN || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const findings = [];
  let errors = [];
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    recordVideo: { dir: "evidence/raw", size: { width: 1440, height: 1000 } },
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  const shot = async (name) => {
    await page.waitForTimeout(700);
    await page.screenshot({
      path: `evidence/screenshots/${name}.png`,
      fullPage: true,
    });
  };
  const pass = (id, result) => findings.push({ id, result, status: "PASS" });
  await page.goto("http://127.0.0.1:3300");
  await page.getByRole("heading", { name: "Welcome back" }).waitFor();
  await shot("01-login");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await page.locator("#name").fill("Demo Resident");
  const mobile = "09" + String(Date.now()).slice(-9);
  await page.locator("#mobile").fill(mobile);
  await page.locator("#password").fill("ResidentDemo2026!");
  await page.locator("#authForm button[type=submit]").click();
  await page.getByRole("heading", { name: "Hello, Demo." }).waitFor();
  pass(
    "B01",
    "A resident can register through the interface and reach the dashboard.",
  );
  await shot("02-home");
  await page.getByRole("link", { name: "Report an incident" }).click();
  await page.locator("#reportForm button[type=submit]").click();
  await page
    .locator("[data-error=category]")
    .filter({ hasText: "Choose a category." })
    .waitFor();
  assert.equal(await page.locator("[aria-invalid=true]").count(), 3);
  assert.equal(await page.evaluate(() => document.activeElement.id), "category");
  pass(
    "B02",
    "Required fields show inline errors and the first invalid field receives focus.",
  );
  await shot("03-validation");
  await page.locator("#category").selectOption("Uncollected garbage");
  await page
    .locator("#description")
    .fill(
      "Demo only: waste bags are obstructing the footpath beside the community waiting shed.",
    );
  await page
    .locator("#address")
    .fill("Demo Street, beside the community waiting shed");
  await page.locator("[name=anonymous]").check();
  await page.locator("#reportForm button[type=submit]").click();
  await page.getByRole("heading", { name: "Review your report" }).waitFor();
  await shot("04-review");
  await page.getByRole("link", { name: "Edit details", exact: true }).click();
  assert.match(await page.locator("#description").inputValue(), /waste bags/);
  await page
    .locator("#address")
    .fill("Demo Street, beside the waiting shed, near Gate 2");
  await page.locator("#reportForm button[type=submit]").click();
  await page.getByRole("heading", { name: "Review your report" }).waitFor();
  assert.match(await page.locator(".details").innerText(), /Gate 2/);
  pass(
    "B03",
    "Review-to-edit retains form data and shows the revised location.",
  );
  await page.getByRole("button", { name: "Submit report" }).click();
  await page.getByRole("heading", { name: "Report submitted!" }).waitFor();
  const ref = await page.locator(".reference-box strong").innerText();
  assert.match(ref, /BR-\d{6}/);
  await shot("05-success");
  await page.getByRole("link", { name: "Track this report" }).click();
  await page.getByRole("heading", { name: "Progress timeline" }).waitFor();
  pass(
    "B04",
    "Submission confirms a reference and opens the resident timeline.",
  );
  await shot("06-tracking");
  const reportURL = page.url();
  const staffContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const staff = await staffContext.newPage();
  await staff.goto("http://127.0.0.1:3300");
  await staff.locator("#mobile").fill("09990000001");
  await staff.locator("#password").fill("ClassroomDemo2026!");
  await staff.locator("#authForm button[type=submit]").click();
  await staff.getByRole("heading", { name: "Report queue" }).waitFor();
  await staff.screenshot({
    path: "evidence/screenshots/07-staff-queue.png",
    fullPage: true,
  });
  await staff.locator(".report-card").filter({ hasText: ref }).click();
  await staff.getByText("Identity withheld", { exact: true }).waitFor();
  assert.ok(!(await staff.locator("main").innerText()).includes(mobile));
  pass("B05", "Anonymous reporter name and mobile are hidden in staff detail.");
  await staff.locator("#status").selectOption("in-progress");
  await staff
    .locator("#note")
    .fill(
      "Demo update: inspection assigned to the community maintenance team.",
    );
  await staff.locator("#statusForm button").click();
  await staff
    .getByText(
      "Demo update: inspection assigned to the community maintenance team.",
      { exact: true },
    )
    .waitFor();
  await staff.screenshot({
    path: "evidence/screenshots/08-staff-update.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Refresh" }).click();
  await page
    .getByText(
      "Demo update: inspection assigned to the community maintenance team.",
      { exact: true },
    )
    .waitFor();
  pass("B06", "A staff update appears on the resident timeline after refresh.");
  await shot("09-resident-update");
  await staff.locator("#status").selectOption("resolved");
  await staff
    .locator("#note")
    .fill("Demo update: cleanup completed and the footpath is clear.");
  await staff.locator("#statusForm button").click();
  await staff
    .getByText("Demo update: cleanup completed and the footpath is clear.", {
      exact: true,
    })
    .waitFor();
  await page.getByRole("button", { name: "Refresh" }).click();
  await page
    .getByText("Demo update: cleanup completed and the footpath is clear.", {
      exact: true,
    })
    .waitFor();
  assert.equal(await page.locator(".timeline li").count(), 3);
  await shot("10-resolved");
  pass("B07", "Resolution preserves all three timeline entries.");
  await page.getByRole("link", { name: "Back to my reports" }).click();
  await page.locator("#reportSearch").fill(ref);
  assert.equal(await page.locator(".report-card").count(), 1);
  await page.getByRole("button", { name: "In progress", exact: true }).click();
  await page.getByRole("heading", { name: "No matching reports" }).waitFor();
  await page.getByRole("button", { name: "Resolved", exact: true }).click();
  assert.equal(await page.locator(".report-card").count(), 1);
  pass(
    "B08",
    "Search and status filters return the matching report or an empty state.",
  );
  await shot("11-filtered");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(reportURL);
  await page.getByRole("heading", { name: "Progress timeline" }).waitFor();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await shot("12-mobile-tracking");
  pass("B09", "390px mobile detail layout has no horizontal overflow.");
  await page.locator('.mobile-nav a[href="#new"]').click();
  await page.getByRole("heading", { name: "New report" }).waitFor();
  await page.getByRole("button", { name: "Use my location" }).click();
  await page
    .locator("#gpsInfo")
    .filter({ hasText: "Location unavailable or permission denied." })
    .waitFor({ timeout: 15000 });
  await page.locator("#address").fill("Manual location after GPS denial");
  assert.equal(
    await page.locator("#address").inputValue(),
    "Manual location after GPS denial",
  );
  pass("B10", "GPS denial leaves manual location entry available.");
  await shot("13-mobile-form");
  await context.setOffline(true);
  await page.locator("#category").selectOption("Road damage");
  await page
    .locator("#description")
    .fill("Demo pothole close to the waiting shed at Gate 2.");
  await page.locator("#reportForm button[type=submit]").click();
  await page.getByRole("button", { name: "Submit report" }).click();
  await page
    .locator("#formError")
    .filter({ hasText: "Cannot connect." })
    .waitFor();
  await context.setOffline(false);
  await page.getByRole("link", { name: "Edit details", exact: true }).click();
  assert.match(await page.locator("#description").inputValue(), /Demo pothole/);
  pass(
    "B11",
    "Network failure keeps the report draft available for correction and retry.",
  );
  assert.deepEqual(errors, []);
  pass("B12", "No uncaught browser JavaScript errors during the tested flow.");
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.getByRole("heading", { name: "Welcome back" }).waitFor();
  await page.locator("#mobile").fill("09990000001");
  await page.locator("#password").fill("ClassroomDemo2026!");
  await page.locator("#authForm button[type=submit]").click();
  await page.getByRole("heading", { name: "Report queue" }).waitFor();
  pass("B13", "Sign-out returns to sign-in and permits resident-to-staff switching in the same browser.");
  assert.deepEqual(errors, []);
  const video = await page.video().path();
  await context.close();
  await staffContext.close();
  await browser.close();
  fs.writeFileSync(
    "evidence/browser-results.json",
    JSON.stringify(
      {
        executedAt: new Date().toISOString(),
        method:
          "Automated Chromium/Playwright; not representative-user testing",
        checks: findings,
        video,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify(findings, null, 2));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
