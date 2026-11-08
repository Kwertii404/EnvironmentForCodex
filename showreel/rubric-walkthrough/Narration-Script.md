# LabTracker — readable chapter cards

One Kokoro am_michael narrator. Each title card has a 2.5-second fully visible hold. Playback duration: 4:57.5.

## 0:02.5 — One laboratory. Many details.

An equipment label. A repair note. A changing status. Keeping these details connected is a practical challenge in a computer laboratory.

## 0:10.5 — From scattered notes

When records are separated, even a simple question takes longer to answer: which equipment is working, and which needs attention?

## 0:19.5 — LABTRACKER

Meet LabTracker, our native PHP and MySQL application for equipment records and maintenance tracking.

## 0:30.0 — 01 / A clear starting point

We begin with administrator sign in. The password stays hidden, and the application opens a shared workspace for managing laboratory assets.

## 0:42.0 — The current picture

The dashboard summarizes equipment conditions and active maintenance, with this month’s completed maintenance costs above. These figures come from our sample records.

## 0:54.0 — Navigate with context

Below, equipment condition and laboratory summaries add context. The sidebar navigation keeps equipment, maintenance, reference data, and accounts within reach.

## 1:07.5 — 02 / Give every item a record

Let’s follow one disposable sample. We enter its asset tag, choose its category and laboratory, and add the brand, model, and serial number.

## 1:21.5 — Saved. Ready to inspect.

After saving, LabTracker confirms that the equipment was added. The detail page brings the stored information together in one readable record.

## 1:31.5 — Find the same record

Next, we search for the sample asset tag. The matching row gives us direct access to viewing, editing, and deleting that equipment.

## 1:42.5 — Details in one place

Opening View lets us check the saved details before making a change. We are following the same item throughout this demonstration.

## 1:51.5 — A meaningful update

Suppose an inspection finds a flickering screen. We change the condition to Defective and add an inspection note, then save the updated record.

## 2:04.5 — The change is saved

The detail page now shows the new condition and note. This verifies that the edit was stored.

## 2:12.5 — Remove only the disposable sample

Finally, we delete this disposable sample. The application asks for confirmation, protects equipment with maintenance history, and returns to the equipment list.

## 2:25.0 — 03 / Connect the repair work

For maintenance, we use our retained sample item. A repair entry connects the reported issue and date directly to the selected equipment.

## 2:37.0 — Equipment and repair stay linked

Saving an open repair marks this item Under Repair. The equipment list and maintenance entry describe two parts of the same situation.

## 2:48.0 — Record the resolution

After the sample repair, we select Done, enter a completion date, choose Working after verification, and describe the resolution. The saved record preserves what was reported and completed.

## 3:02.5 — 04 / Accounts with clear feedback

Administrators can also manage accounts. Here, a deliberately weak sample password is rejected with specific guidance about the requirements.

## 3:13.5 — Create a sample technician

We correct the password and create a disposable technician account. Passwords remain masked during entry, and the account list shows its role and status.

## 3:26.5 — Control account availability

We edit the sample account’s name, then deactivate it. Its status changes, preventing continued access while keeping the account record.

## 3:40.0 — 05 / Look beneath the interface

The source uses PHP password hashing and password verification. Protected pages require a session, and account activity is checked again on each request.

## 3:52.0 — Checks in the request path

Database operations use prepared statements. Server-side validation checks submitted values, while CSRF tokens are checked on form requests. These are specific implementation details.

## 4:03.0 — Five tables. Connected records.

The schema links equipment to laboratories and categories. Maintenance records reference equipment and the reporting user, connecting asset information with recorded work.

## 4:15.0 — Access checked after logout

We also test the behavior: after logout, opening the equipment page redirects to sign in. The earlier invalid password was rejected before account creation.

## 4:27.5 — Records → maintenance → administration

From creating and finding equipment to recording repairs and managing accounts, LabTracker brings these everyday laboratory tasks into a consistent workflow.

## 4:38.5 — The people behind the project

The people behind the project. Jacinth Dhane Mendoza, main developer. Jerico Teologo, interface and user experience design. Shena May Gadon, database design and data management.

## 4:51.5 — LABTRACKER

LabTracker. From equipment records to organized maintenance.
