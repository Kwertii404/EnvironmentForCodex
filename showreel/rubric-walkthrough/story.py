import json
# Absolute editorial windows; audio is measured inside each window.
rows=[
(0,8,'hook','One laboratory. Many details.','An equipment label. A repair note. A changing status. Keeping these details connected is a practical challenge in a computer laboratory.'),
(8,17,'hook','From scattered notes','When records are separated, even a simple question takes longer to answer: which equipment is working, and which needs attention?'),
(17,25,'reveal','LABTRACKER','Meet LabTracker, our native PHP and MySQL application for equipment records and maintenance tracking.'),
(25,37,'login','01 / A clear starting point','We begin with administrator sign in. The password stays hidden, and the application opens a shared workspace for managing laboratory assets.'),
(37,49,'dashboard','The current picture','The dashboard summarizes equipment conditions and active maintenance, with this month’s completed maintenance costs above. These figures come from our sample records.'),
(49,60,'dashboard','Navigate with context','Below, equipment condition and laboratory summaries add context. The sidebar navigation keeps equipment, maintenance, reference data, and accounts within reach.'),
(60,74,'create','02 / Give every item a record','Let’s follow one disposable sample. We enter its asset tag, choose its category and laboratory, and add the brand, model, and serial number.'),
(74,84,'created','Saved. Ready to inspect.','After saving, LabTracker confirms that the equipment was added. The detail page brings the stored information together in one readable record.'),
(84,95,'search','Find the same record','Next, we search for the sample asset tag. The matching row gives us direct access to viewing, editing, and deleting that equipment.'),
(95,104,'view','Details in one place','Opening View lets us check the saved details before making a change. We are following the same item throughout this demonstration.'),
(104,117,'update','A meaningful update','Suppose an inspection finds a flickering screen. We change the condition to Defective and add an inspection note, then save the updated record.'),
(117,125,'updated','The change is saved','The detail page now shows the new condition and note. This verifies that the edit was stored.'),
(125,135,'delete','Remove only the disposable sample','Finally, we delete this disposable sample. The application asks for confirmation, protects equipment with maintenance history, and returns to the equipment list.'),
(135,147,'maintenance','03 / Connect the repair work','For maintenance, we use our retained sample item. A repair entry connects the reported issue and date directly to the selected equipment.'),
(147,158,'repair','Equipment and repair stay linked','Saving an open repair marks this item Under Repair. The equipment list and maintenance entry describe two parts of the same situation.'),
(158,170,'done','Record the resolution','After the sample repair, we select Done, enter a completion date, choose Working after verification, and describe the resolution. The saved record preserves what was reported and completed.'),
(170,181,'validation','04 / Accounts with clear feedback','Administrators can also manage accounts. Here, a deliberately weak sample password is rejected with specific guidance about the requirements.'),
(181,194,'account','Create a sample technician','We correct the password and create a disposable technician account. Passwords remain masked during entry, and the account list shows its role and status.'),
(194,205,'deactivate','Control account availability','We edit the sample account’s name, then deactivate it. Its status changes, preventing continued access while keeping the account record.'),
(205,217,'code','05 / Look beneath the interface','The source uses PHP password hashing and password verification. Protected pages require a session, and account activity is checked again on each request.'),
(217,228,'prepared','Checks in the request path','Database operations use prepared statements. Server-side validation checks submitted values, while CSRF tokens are checked on form requests. These are specific implementation details.'),
(228,240,'schema','Five tables. Connected records.','The schema links equipment to laboratories and categories. Maintenance records reference equipment and the reporting user, connecting asset information with recorded work.'),
(240,250,'logout','Access checked after logout','We also test the behavior: after logout, opening the equipment page redirects to sign in. The earlier invalid password was rejected before account creation.'),
(250,261,'recap','Records → maintenance → administration','From creating and finding equipment to recording repairs and managing accounts, LabTracker brings these everyday laboratory tasks into a consistent workflow.'),
(261,274,'team','The presentation team','Jacinth Dhane Mendoza is the main developer. For this presentation, Jerico Teologo covers equipment and maintenance; Shena May Gadon covers accounts and the recap.'),
(274,280,'end','LABTRACKER','LabTracker. From equipment records to organized maintenance.')]
chapters=[(0,25,'Introduction'),(25,60,'Login & dashboard'),(60,135,'Equipment CRUD'),(135,170,'Maintenance'),(170,205,'Accounts'),(205,250,'Implementation'),(250,280,'Team & recap')]
data=[]
for i,(a,b,kind,title,text) in enumerate(rows):
 speaker='Jerico Teologo' if 60<=a<170 else 'Shena May Gadon' if 170<=a<205 or a>=250 else 'Jacinth Dhane Mendoza'
 data.append(dict(id=i,start=a,end=b,kind=kind,title=title,text=text,speaker=speaker))
json.dump(data,open('story.json','w'),indent=2)
json.dump(chapters,open('chapters.json','w'),indent=2)
print('WORDS',sum(len(r['text'].split()) for r in data))
with open('Narration-Script.md','w') as f:
 f.write('# LabTracker — narration and speaking assignments\n\nTemporary Kokoro narration draft. Replace with member recordings for the submission version. Roles below are assigned presentation responsibilities, not claims of development authorship. Jacinth is the confirmed main developer.\n\n')
 for r in data:f.write(f"## {r['start']//60}:{r['start']%60:02d}–{r['end']//60}:{r['end']%60:02d} · {r['speaker']}\n\n{r['text']}\n\n")
