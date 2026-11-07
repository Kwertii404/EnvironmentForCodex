# LabTracker — narration and speaking assignments

Temporary Kokoro narration draft. Replace with member recordings for the submission version. Roles below are assigned presentation responsibilities, not claims of development authorship. Jacinth is the confirmed main developer.

## 0:00–0:08 · Jacinth Dhane Mendoza

An equipment label. A repair note. A changing status. Keeping these details connected is a practical challenge in a computer laboratory.

## 0:08–0:17 · Jacinth Dhane Mendoza

When records are separated, even a simple question takes longer to answer: which equipment is working, and which needs attention?

## 0:17–0:25 · Jacinth Dhane Mendoza

Meet LabTracker, our native PHP and MySQL application for equipment records and maintenance tracking.

## 0:25–0:37 · Jacinth Dhane Mendoza

We begin with administrator sign in. The password stays hidden, and the application opens a shared workspace for managing laboratory assets.

## 0:37–0:49 · Jacinth Dhane Mendoza

The dashboard summarizes equipment conditions and active maintenance, with this month’s completed maintenance costs above. These figures come from our sample records.

## 0:49–1:00 · Jacinth Dhane Mendoza

Below, equipment condition and laboratory summaries add context. The sidebar navigation keeps equipment, maintenance, reference data, and accounts within reach.

## 1:00–1:14 · Jerico Teologo

Let’s follow one disposable sample. We enter its asset tag, choose its category and laboratory, and add the brand, model, and serial number.

## 1:14–1:24 · Jerico Teologo

After saving, LabTracker confirms that the equipment was added. The detail page brings the stored information together in one readable record.

## 1:24–1:35 · Jerico Teologo

Next, we search for the sample asset tag. The matching row gives us direct access to viewing, editing, and deleting that equipment.

## 1:35–1:44 · Jerico Teologo

Opening View lets us check the saved details before making a change. We are following the same item throughout this demonstration.

## 1:44–1:57 · Jerico Teologo

Suppose an inspection finds a flickering screen. We change the condition to Defective and add an inspection note, then save the updated record.

## 1:57–2:05 · Jerico Teologo

The detail page now shows the new condition and note. This verifies that the edit was stored.

## 2:05–2:15 · Jerico Teologo

Finally, we delete this disposable sample. The application asks for confirmation, protects equipment with maintenance history, and returns to the equipment list.

## 2:15–2:27 · Jerico Teologo

For maintenance, we use our retained sample item. A repair entry connects the reported issue and date directly to the selected equipment.

## 2:27–2:38 · Jerico Teologo

Saving an open repair marks this item Under Repair. The equipment list and maintenance entry describe two parts of the same situation.

## 2:38–2:50 · Jerico Teologo

After the sample repair, we select Done, enter a completion date, choose Working after verification, and describe the resolution. The saved record preserves what was reported and completed.

## 2:50–3:01 · Shena May Gadon

Administrators can also manage accounts. Here, a deliberately weak sample password is rejected with specific guidance about the requirements.

## 3:01–3:14 · Shena May Gadon

We correct the password and create a disposable technician account. Passwords remain masked during entry, and the account list shows its role and status.

## 3:14–3:25 · Shena May Gadon

We edit the sample account’s name, then deactivate it. Its status changes, preventing continued access while keeping the account record.

## 3:25–3:37 · Jacinth Dhane Mendoza

The source uses PHP password hashing and password verification. Protected pages require a session, and account activity is checked again on each request.

## 3:37–3:48 · Jacinth Dhane Mendoza

Database operations use prepared statements. Server-side validation checks submitted values, while CSRF tokens are checked on form requests. These are specific implementation details.

## 3:48–4:00 · Jacinth Dhane Mendoza

The schema links equipment to laboratories and categories. Maintenance records reference equipment and the reporting user, connecting asset information with recorded work.

## 4:00–4:10 · Jacinth Dhane Mendoza

We also test the behavior: after logout, opening the equipment page redirects to sign in. The earlier invalid password was rejected before account creation.

## 4:10–4:21 · Shena May Gadon

From creating and finding equipment to recording repairs and managing accounts, LabTracker brings these everyday laboratory tasks into a consistent workflow.

## 4:21–4:34 · Shena May Gadon

Jacinth Dhane Mendoza is the main developer. For this presentation, Jerico Teologo covers equipment and maintenance; Shena May Gadon covers accounts and the recap.

## 4:34–4:40 · Shena May Gadon

LabTracker. From equipment records to organized maintenance.
