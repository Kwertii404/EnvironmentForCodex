import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
const dir = mkdtempSync(join(tmpdir(), "barangay-test-")),
  port = 3397,
  base = `http://127.0.0.1:${port}`;
let child;
async function start() {
  child = spawn(process.execPath, ["server.mjs"], {
    env: {
      ...process.env,
      PORT: String(port),
      DB_PATH: join(dir, "test.sqlite"),
      STAFF_PASSWORD: "IntegrationTest2026!",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base + "/api/health")).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error("Server did not start");
}
async function stop() {
  const done = once(child, "exit");
  child.kill("SIGTERM");
  await done;
}
async function request(path, { method = "GET", body, cookie, origin } = {}) {
  const res = await fetch(base + "/api" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...(origin ? { Origin: origin } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: res.status,
    data: await res.json(),
    cookie: res.headers.get("set-cookie")?.split(";")[0],
  };
}
const payload = {
  clientKey: "test-submission-0001",
  category: "Uncollected garbage",
  description: "Garbage has accumulated beside the demonstration waiting shed.",
  address: "Demo Street, near the waiting shed",
  lat: 14.5995,
  lng: 120.9842,
  anonymous: true,
};
await test("BarangayReport end-to-end API integration", async (t) => {
  await start();
  t.after(async () => {
    if (child?.exitCode === null) await stop();
    rmSync(dir, { recursive: true, force: true });
  });
  let resident, other, staff, report;
  await t.test("F01: unauthenticated requests cannot list reports", async () =>
    assert.equal((await request("/reports")).status, 401),
  );
  await t.test(
    "F02: account validation rejects incomplete registration",
    async () => {
      const r = await request("/register", {
        method: "POST",
        body: { name: "A", mobile: "abc", password: "short" },
      });
      assert.equal(r.status, 400);
      assert.deepEqual(Object.keys(r.data.fields).sort(), [
        "mobile",
        "name",
        "password",
      ]);
    },
  );
  await t.test(
    "F03: resident registration creates a session without leaking password",
    async () => {
      const r = await request("/register", {
        method: "POST",
        body: {
          name: "Test Resident",
          mobile: "09991110001",
          password: "ResidentTest2026!",
        },
      });
      assert.equal(r.status, 201);
      assert.ok(r.cookie);
      assert.equal(r.data.user.role, "resident");
      assert.equal(r.data.user.password, undefined);
      resident = r.cookie;
    },
  );
  await t.test("F04: duplicate accounts are rejected", async () =>
    assert.equal(
      (
        await request("/register", {
          method: "POST",
          body: {
            name: "Duplicate",
            mobile: "09991110001",
            password: "ResidentTest2026!",
          },
        })
      ).status,
      409,
    ),
  );
  await t.test("F05: incorrect password does not authenticate", async () =>
    assert.equal(
      (
        await request("/login", {
          method: "POST",
          body: { mobile: "09991110001", password: "incorrect-password" },
        })
      ).status,
      401,
    ),
  );
  await t.test(
    "F06: category, description and location are validated on server",
    async () => {
      const r = await request("/reports", {
        method: "POST",
        cookie: resident,
        body: { ...payload, category: "invalid", description: "", address: "" },
      });
      assert.equal(r.status, 400);
      assert.ok(
        r.data.fields.category &&
          r.data.fields.description &&
          r.data.fields.address,
      );
    },
  );
  await t.test("F07: invalid GPS coordinates are rejected", async () =>
    assert.equal(
      (
        await request("/reports", {
          method: "POST",
          cookie: resident,
          body: { ...payload, lat: 1000 },
        })
      ).status,
      400,
    ),
  );
  await t.test(
    "F08: non-image data cannot be uploaded as a photo",
    async () => {
      const r = await request("/reports", {
        method: "POST",
        cookie: resident,
        body: {
          ...payload,
          photo: "data:image/png;base64,PGh0bWw+YWJjPC9odG1sPg==",
        },
      });
      assert.equal(r.status, 400);
      assert.ok(r.data.fields.photo);
    },
  );
  await t.test(
    "F09: submission produces a reference and an initial timeline event",
    async () => {
      const r = await request("/reports", {
        method: "POST",
        cookie: resident,
        body: payload,
      });
      assert.equal(r.status, 201);
      report = r.data.report;
      assert.match(report.reference, /^BR-\d{6}$/);
      assert.equal(report.status, "received");
      assert.equal(report.timeline.length, 1);
      assert.equal(report.address, payload.address);
    },
  );
  await t.test(
    "F10: retrying a submission does not create a duplicate",
    async () => {
      const r = await request("/reports", {
        method: "POST",
        cookie: resident,
        body: payload,
      });
      assert.equal(r.status, 200);
      assert.equal(r.data.report.id, report.id);
      assert.equal(
        (await request("/reports", { cookie: resident })).data.reports.length,
        1,
      );
    },
  );
  await t.test(
    "F11: another resident cannot read a report or its photo",
    async () => {
      other = (
        await request("/register", {
          method: "POST",
          body: {
            name: "Second Resident",
            mobile: "09991110002",
            password: "ResidentTest2026!",
          },
        })
      ).cookie;
      assert.equal(
        (await request("/reports/" + report.id, { cookie: other })).status,
        404,
      );
      assert.equal(
        (await request("/reports/" + report.id + "/photo", { cookie: other }))
          .status,
        404,
      );
      assert.deepEqual(
        (await request("/reports", { cookie: other })).data.reports,
        [],
      );
    },
  );
  await t.test("F12: residents cannot update status", async () =>
    assert.equal(
      (
        await request(`/reports/${report.id}/status`, {
          method: "PATCH",
          cookie: resident,
          body: { status: "resolved", note: "Unauthorized update" },
        })
      ).status,
      403,
    ),
  );
  await t.test(
    "F13: staff can sign in and anonymous identity is withheld",
    async () => {
      const r = await request("/login", {
        method: "POST",
        body: { mobile: "09990000001", password: "IntegrationTest2026!" },
      });
      assert.equal(r.status, 200);
      staff = r.cookie;
      const result = (await request("/reports/" + report.id, { cookie: staff }))
        .data.report;
      assert.deepEqual(result.reporter, {
        name: "Identity withheld",
        mobile: null,
      });
      assert.equal(result.owner_id, undefined);
    },
  );
  await t.test("F14: staff update appears in resident timeline", async () => {
    const r = await request(`/reports/${report.id}/status`, {
      method: "PATCH",
      cookie: staff,
      body: {
        status: "in-progress",
        note: "Assigned for inspection in the classroom demonstration.",
      },
    });
    assert.equal(r.status, 200);
    const detail = (
      await request("/reports/" + report.id, { cookie: resident })
    ).data.report;
    assert.equal(detail.status, "in-progress");
    assert.equal(detail.timeline.length, 2);
    assert.match(detail.timeline[1].note, /Assigned/);
  });
  await t.test(
    "F15: invalid and redundant status updates are rejected",
    async () => {
      assert.equal(
        (
          await request(`/reports/${report.id}/status`, {
            method: "PATCH",
            cookie: staff,
            body: { status: "unknown", note: "Some update" },
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await request(`/reports/${report.id}/status`, {
            method: "PATCH",
            cookie: staff,
            body: { status: "in-progress", note: "Repeat update" },
          })
        ).status,
        409,
      );
    },
  );
  await t.test("F16: resolved status preserves earlier history", async () => {
    const r = await request(`/reports/${report.id}/status`, {
      method: "PATCH",
      cookie: staff,
      body: {
        status: "resolved",
        note: "Demonstration cleanup recorded; concern marked resolved.",
      },
    });
    assert.equal(r.status, 200);
    assert.deepEqual(
      r.data.report.timeline.map((x) => x.status),
      ["received", "in-progress", "resolved"],
    );
  });
  await t.test("F17: photo storage and authorized retrieval work", async () => {
    const photo =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6SAAAAABJRU5ErkJggg==";
    const r = await request("/reports", {
      method: "POST",
      cookie: resident,
      body: {
        ...payload,
        clientKey: "photo-test-key-0001",
        anonymous: false,
        photo,
      },
    });
    assert.equal(r.status, 201);
    const response = await fetch(
      base + `/api/reports/${r.data.report.id}/photo`,
      { headers: { Cookie: resident } },
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/png");
    assert.ok((await response.arrayBuffer()).byteLength > 20);
    const detail = (
      await request("/reports/" + r.data.report.id, { cookie: staff })
    ).data.report;
    assert.equal(detail.reporter.name, "Test Resident");
  });
  await t.test("F18: cross-site mutation attempts are rejected", async () =>
    assert.equal(
      (
        await request("/reports", {
          method: "POST",
          cookie: resident,
          origin: "https://untrusted.example",
          body: payload,
        })
      ).status,
      403,
    ),
  );
  await t.test(
    "F19: reports and history survive a server restart",
    async () => {
      await stop();
      await start();
      const r = await request("/reports/" + report.id, { cookie: resident });
      assert.equal(r.status, 200);
      assert.equal(r.data.report.timeline.length, 3);
      assert.equal(r.data.report.status, "resolved");
    },
  );
  await t.test("F20: logout invalidates the server session", async () => {
    assert.equal(
      (await request("/logout", { method: "POST", cookie: resident, body: {} }))
        .status,
      200,
    );
    assert.equal((await request("/reports", { cookie: resident })).status, 401);
  });
});
