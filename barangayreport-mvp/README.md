# BarangayReport MVP

A working, locally hosted incident-reporting prototype based on the supplied Part 2 wireframes. Residents can register, submit a concern, attach an optional photo and GPS coordinates, review before submitting, withhold their identity from the staff view, and track status updates. Staff can manage a report queue and post resident-visible updates.

**Classroom MVP only. It is not connected to a real barangay office or emergency service. Use fictional test data.**

## Run

Install Node.js **24 or newer**. There are no runtime packages to install: HTTP, cryptography and SQLite use Node built-ins.

On macOS/Linux, from this folder:

```bash
STAFF_PASSWORD='ClassroomDemo2026!' npm start
```

On Windows PowerShell:

```powershell
$env:STAFF_PASSWORD='ClassroomDemo2026!'
npm start
```

Open **http://127.0.0.1:3300**.

- Resident: choose **Create account**. Use fictional details, a 10–15 digit mobile number and a password of at least 10 characters.
- Staff demo login: **09990000001**, password **ClassroomDemo2026!**, if started with the example command above.
- `STAFF_PASSWORD` creates the initial staff account only. Changing the variable later does not reset an existing account. `STAFF_MOBILE` optionally changes its initial mobile number.
- Reports and accounts persist in `data/barangay.sqlite`. The database is intentionally excluded from the source package and Git. Stop the server before intentionally deleting `data/` to reset a disposable demo.
- `PORT`, `HOST`, and `DB_PATH` can override the local defaults. Default binding is loopback; this is not a public deployment. HTTPS is required for secure remote use and reliable browser geolocation. Set `COOKIE_SECURE=1` behind correctly configured HTTPS. A production release needs the additional work listed in the report.

## A short demonstration

1. Create a resident account and select **Report an incident**.
2. Try **Review report** with empty fields to see validation.
3. Enter a category, description and a recognizable location. Optionally attach a JPG/PNG up to 2 MB and request GPS.
4. Choose whether to withhold your identity. Review, edit if needed, and submit.
5. Save the reference number and open its timeline.
6. In a different browser profile or private window, sign in as staff. Open the report, set **In progress**, and enter an update.
7. Refresh the resident timeline. Then let staff mark it **Resolved** with a second note.
8. Try status filters, reference search, and a narrow mobile viewport.

See `evidence/BarangayReport-Functional-Walkthrough.mp4` for the recorded browser run. It is an automated, silent functional walkthrough, not a recording of representative-user testing. Staff actions occur in a second browser session; screenshots 07 and 08 capture that staff view.

## Tests

```bash
npm test
```

The 20 named API checks use a separate temporary database and test server on port 3397. They cover authentication, field validation, report creation, retry deduplication, access restrictions, photo storage, anonymity, staff updates, persistence and logout. The TAP runner also counts the parent suite, so its summary reports 21 passes.

Optional browser testing requires Playwright and Chromium. Install Playwright locally with `npm install --no-save playwright`, and set `BROWSER_BIN` to your Chromium executable if it is not `/usr/bin/chromium`. Start the demo app on port 3300 with the staff demo password before running:

```bash
npm run test:browser
```

For a shared, existing Playwright installation, set `PLAYWRIGHT_PATH` to its package directory. The browser test creates fictional resident accounts and reports on the demo database. It records the run and screenshots. If rerunning repeatedly, use a clean disposable database or wait for the login rate-limit window to expire. Do not use it against real resident data.

## Files to explain during presentation

| File | Purpose |
| --- | --- |
| `server.mjs` | HTTP routes, validation, accounts/sessions, access control, SQLite records and history |
| `public/index.html` | Page entry point |
| `public/app.js` | Resident/staff screens, form state, review, API calls and navigation |
| `public/style.css` | Responsive layout and wireframe-inspired visual design |
| `test/api.test.mjs` | Repeatable functional integration tests |
| `test/browser.cjs` | Actual browser workflow checks and capture |
| `docs/` | Part 3 report, testing plan, blank user-feedback records, revision log and limitations |
| `evidence/` | Executed test outputs, screenshots and recorded walkthrough |

## Data and limitations

Passwords use salted scrypt hashes; sessions use random tokens in HttpOnly, SameSite cookies. The server checks report ownership and staff permissions. Anonymous reports hide contact details in the staff UI, but remain linked internally to the account. Photo metadata is not stripped. The prototype does not include OTP verification, password recovery, spam moderation, resident editing/deletion after submission, SMS/push updates, or a live barangay integration.

**No representative-user testing has been claimed.** The three-participant plan and feedback templates are ready, but actual sessions or instructor approval remain pending.

## Part 3 documentation

`docs/BarangayReport-Part3.pdf` is the readable report; the `.docx` version is editable. The report describes verified implementation and developer test results while clearly marking representative-user feedback as pending. CSV templates support the three-participant study and revision tracking.

`evidence/BarangayReport-Guided-Walkthrough.mp4` is the slower, silent presentation recording showing both resident and staff workflows. Its captions identify each step. It uses fictional incidents and deliberate pauses.

To regenerate the report after changing evidence, run `python docs/build_report.py` with `python-docx`, `reportlab` and `Pillow` installed. These packages are needed only for document generation, not for the application.
