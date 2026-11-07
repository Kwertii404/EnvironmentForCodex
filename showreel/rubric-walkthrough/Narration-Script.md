# LabTracker — single-narrator revision

Voice: Kokoro am_michael throughout. Team-role labels were selected at the user’s request; they are role assignments rather than independently verified work-history claims.

## 0:00–0:08 — One laboratory. Many details.

An equipment label. A repair note. A changing status. Keeping these details connected is a practical challenge in a computer laboratory.

## 0:08–0:17 — From scattered notes

When records are separated, even a simple question takes longer to answer: which equipment is working, and which needs attention?

## 0:17–0:25 — LABTRACKER

Meet LabTracker, our native PHP and MySQL application for equipment records and maintenance tracking.

## 0:25–0:37 — 01 / A clear starting point

We begin with administrator sign in. The password stays hidden, and the application opens a shared workspace for managing laboratory assets.

## 0:37–0:49 — The current picture

The dashboard summarizes equipment conditions and active maintenance, with this month’s completed maintenance costs above. These figures come from our sample records.

## 0:49–1:00 — Navigate with context

Below, equipment condition and laboratory summaries add context. The sidebar navigation keeps equipment, maintenance, reference data, and accounts within reach.

## 1:00–1:14 — 02 / Give every item a record

Let’s follow one disposable sample. We enter its asset tag, choose its category and laboratory, and add the brand, model, and serial number.

## 1:14–1:24 — Saved. Ready to inspect.

After saving, LabTracker confirms that the equipment was added. The detail page brings the stored information together in one readable record.

## 1:24–1:35 — Find the same record

Next, we search for the sample asset tag. The matching row gives us direct access to viewing, editing, and deleting that equipment.

## 1:35–1:44 — Details in one place

Opening View lets us check the saved details before making a change. We are following the same item throughout this demonstration.

## 1:44–1:57 — A meaningful update

Suppose an inspection finds a flickering screen. We change the condition to Defective and add an inspection note, then save the updated record.

## 1:57–2:05 — The change is saved

The detail page now shows the new condition and note. This verifies that the edit was stored.

## 2:05–2:15 — Remove only the disposable sample

Finally, we delete this disposable sample. The application asks for confirmation, protects equipment with maintenance history, and returns to the equipment list.

## 2:15–2:27 — 03 / Connect the repair work

For maintenance, we use our retained sample item. A repair entry connects the reported issue and date directly to the selected equipment.

## 2:27–2:38 — Equipment and repair stay linked

Saving an open repair marks this item Under Repair. The equipment list and maintenance entry describe two parts of the same situation.

## 2:38–2:50 — Record the resolution

After the sample repair, we select Done, enter a completion date, choose Working after verification, and describe the resolution. The saved record preserves what was reported and completed.

## 2:50–3:01 — 04 / Accounts with clear feedback

Administrators can also manage accounts. Here, a deliberately weak sample password is rejected with specific guidance about the requirements.

## 3:01–3:14 — Create a sample technician

We correct the password and create a disposable technician account. Passwords remain masked during entry, and the account list shows its role and status.

## 3:14–3:25 — Control account availability

We edit the sample account’s name, then deactivate it. Its status changes, preventing continued access while keeping the account record.

## 3:25–3:37 — 05 / Look beneath the interface

The source uses PHP password hashing and password verification. Protected pages require a session, and account activity is checked again on each request.

## 3:37–3:48 — Checks in the request path

Database operations use prepared statements. Server-side validation checks submitted values, while CSRF tokens are checked on form requests. These are specific implementation details.

## 3:48–4:00 — Five tables. Connected records.

The schema links equipment to laboratories and categories. Maintenance records reference equipment and the reporting user, connecting asset information with recorded work.

## 4:00–4:10 — Access checked after logout

We also test the behavior: after logout, opening the equipment page redirects to sign in. The earlier invalid password was rejected before account creation.

## 4:10–4:21 — Records → maintenance → administration

From creating and finding equipment to recording repairs and managing accounts, LabTracker brings these everyday laboratory tasks into a consistent workflow.

## 4:21–4:34 — The people behind the project

The people behind the project. Jacinth Dhane Mendoza, main developer. Jerico Teologo, interface and user experience design. Shena May Gadon, database design and data management.

## 4:34–4:40 — LABTRACKER

LabTracker. From equipment records to organized maintenance.
