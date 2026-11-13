from pathlib import Path
import json,re,csv,html
from datetime import datetime,timezone
from docx import Document
from docx.shared import Inches,Pt,RGBColor
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak,Image,KeepTogether
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os,reportlab
font_root=Path(os.environ.get('REPORT_FONT_DIR','/usr/share/fonts/truetype/dejavu'))
fallback=Path(reportlab.__file__).parent/'fonts'
for name,file in [('DejaVuSans','DejaVuSans.ttf'),('DejaVuSans-Bold','DejaVuSans-Bold.ttf'),('DejaVuSans-Oblique','DejaVuSans-Oblique.ttf')]:
 target=font_root/file
 if not target.exists(): target=fallback/{'DejaVuSans.ttf':'Vera.ttf','DejaVuSans-Bold.ttf':'VeraBd.ttf','DejaVuSans-Oblique.ttf':'VeraIt.ttf'}[file]
 pdfmetrics.registerFont(TTFont(name,str(target)))
pdfmetrics.registerFontFamily('DejaVuSans',normal='DejaVuSans',bold='DejaVuSans-Bold',italic='DejaVuSans-Oblique',boldItalic='DejaVuSans-Bold')
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'docs'
api=re.findall(r'^\s*ok \d+ - (F\d+): (.+)$',(ROOT/'evidence/api-tests.tap').read_text(),re.M)
browser=json.loads((ROOT/'evidence/browser-results.json').read_text())
assert len(api)==20 and len(browser['checks'])==13
members='Mark Angelo Mariño; Jacinth Dhane Mendoza; John Harold Padilla; Aljun Galanida; Josh Philip Gonzales'
sections=[]
def h(t):sections.append(('h',t))
def p(t):sections.append(('p',t))
def table(headers,rows,widths=None):sections.append(('table',(headers,rows,widths)))
def pic(path,caption):sections.append(('pic',(path,caption)))
def page():sections.append(('page',None))
h('Part 3 — MVP Development and Testing')
p('Project: BarangayReport | BSIT 2 – Block 2 | Version 0.1.0 | Evidence prepared: 11 November 2026')
p('Members: '+members)
p('Evidence status: working MVP and developer testing completed; representative-user testing and user feedback are still pending. This report does not claim instructor approval, real barangay deployment, or testing by three people.')
h('1. Project overview and customer problem')
p('BarangayReport helps residents record a local concern and follow what happens after submission. The working problem statement is that residents need a clear way to report a concern with its location, receive an acknowledgement, and see progress. This statement is inferred from the supplied Part 2 user flow; Part 1 research was not supplied, so the team should confirm the wording against its original customer findings.')
p('The MVP implements the Part 2 sequence: Login/Register → Home → New Report → Review → Submit with reference number → My Reports with status and timeline. A staff workspace was added to make status updates functional from end to end. The product is a responsive web application, not an Android APK, and uses fictional demonstration data.')
h('2. Checklist and evidence readiness')
table(['Requirement','Current status and evidence'],[
['Initial MVP developed','Implemented. Runnable server, resident interface and staff workspace are included in the source folder.'],
['Core features address the customer problem','Implemented against the Part 2 flow. Reporting, acknowledgement and progress tracking are available. Validate the inferred problem statement with the team’s Part 1 research.'],
['Live or recorded demonstration','Available. Local app at http://127.0.0.1:3300 and a recorded walkthrough in evidence/.'],
['Functional testing completed','Completed for the documented scope: 20 API checks and 13 automated browser checks passed.'],
['Three representative users, or approved alternative','Pending. No human participant sessions or instructor approval were supplied. A plan and blank records are included.'],
['User feedback and identified problems recorded','Partial. Developer-detected startup and sign-out issues and their fixes are documented. Representative-user feedback has not yet been collected.'],
['Improvements based on testing results','Implemented: startup and sign-out defects were corrected and the workflow retested. Further usability revisions await real feedback.'],
['Remaining bugs, limitations and next steps','Documented in Section 8 and the limitations register.']], [155,345])
p('Do not mark all eight checklist items complete until the missing human-testing/approved-alternative evidence and feedback records exist.')
page();h('3. Implemented MVP and design decisions')
table(['Feature','What the working MVP does'],[
['Accounts','Resident registration and sign-in; salted password hashes; server-side sessions; separate staff role.'],
['New report','Required category, description and manual location; optional JPG/PNG photo up to 2 MB and optional GPS coordinates.'],
['Review and submit','Review screen, edit/back navigation, validation on client and server, submission acknowledgement and unique BR reference.'],
['Report tracking','Resident-only report list, reference/text search, status filters and chronological updates. Data persists in SQLite.'],
['Staff updates','Staff queue; received, in-progress and resolved states; required resident-visible update note; previous events remain available.'],
['Identity withholding','An anonymous toggle hides name and mobile in staff responses and the interface. The account remains linked internally; this is not full anonymity.'],
['Error handling','Field-level errors, network-failure message with draft retained in memory, duplicate-submission retry protection, GPS-denial manual fallback.']], [110,390])
p('Technology: Node.js 24.19.0, built-in HTTP and SQLite 3.53.3, HTML, CSS and browser JavaScript. No runtime third-party packages are required. This small structure keeps the project easy to run and explain.')
p('Data flow: browser → authenticated HTTP endpoint → SQLite → structured response → updated interface. Tables: users, sessions, reports and events. Each report belongs to one resident; each report has a chronological event history. Access checks run on the server, not only in the interface.')
p('HCI decisions retained from Part 2: visible status labels and reference numbers; consistent navigation and controls; confirmation and inline feedback; labeled actions; review-before-submit; and user control through edit/back navigation and identity withholding. A mobile bottom navigation is provided on narrow screens.')
pic('evidence/screenshots/02-home.png','Figure 1. Working resident dashboard. This is an application capture, not a wireframe.')
page();h('4. Functional testing method and results')
p('Developer checks were executed on 11 November 2026. API tests ran on a separate temporary database and server on port 3397; browser checks exercised the local demo on port 3300 using Chromium and Playwright 1.64.1. These are automated developer tests, not representative-user sessions.')
p('Result: all 20 named API checks passed. The TAP summary shows 21 passes because it includes the parent test in addition to the 20 checks. Evidence: evidence/api-tests.tap and test/api.test.mjs.')
table(['ID','Executed check','Result'],[[i,title,'PASS'] for i,title in api],[35,415,50])
p('The persistence check stops and restarts the server before reading the saved report and history. The access checks use distinct resident sessions. Photo testing verifies permitted retrieval and rejects disguised non-image content; it is not a full malware or image-parser security assessment.')
page();h('5. Browser workflow verification')
p('Result: all 13 documented browser checks passed after the startup and sign-out fixes. Evidence: evidence/browser-results.json, evidence/browser-run.log, and screenshots 01–13. The first failed browser run is retained separately for traceability.')
table(['ID','Observed automated result','Result'],[[x['id'],x['result'],x['status']] for x in browser['checks']],[35,415,50])
p('Scope limits: one desktop Chromium environment, a 390 px mobile viewport, and automated interaction. No physical Android/iOS device testing, assistive-technology audit, public-network deployment testing, or representative-user usability study was performed.')
pic('evidence/screenshots/04-review.png','Figure 2. Review-before-submit screen with identity withholding and editable details.')
page();h('6. Demonstration and source evidence')
p('Run instructions: install Node.js 24 or newer; open the source folder; set STAFF_PASSWORD to a local demo password of at least 12 characters; run npm start; open http://127.0.0.1:3300. README.md contains Windows and macOS/Linux commands. Staff demo mobile is 09990000001. Create a resident account through the interface.')
p('The guided recording demonstrates resident registration, field validation, review/edit, submission, reference tracking, staff sign-in, status updates, and the resident’s final timeline. All incident details are fictional. The separate short automated test recording is retained as functional evidence. Neither recording represents a participant study.')
table(['Evidence','Location'],[
['Working source and run instructions','server.mjs; public/; package.json; README.md'],
['Guided demonstration','evidence/BarangayReport-Guided-Walkthrough.mp4'],
['Automated browser recording','evidence/BarangayReport-Functional-Walkthrough.mp4'],
['Executed test results','evidence/api-tests.tap; evidence/browser-results.json'],
['Interface screenshots','evidence/screenshots/01-login.png through 13-mobile-form.png'],
['Revision record','docs/Revision-Log.csv; Section 7'],
['Human testing plan and blank forms','docs/User-Testing-Plan.md; Participant-Tasks.csv; User-Feedback.csv'],
['Remaining work','docs/Limitations-and-Next-Steps.md; Section 8']], [150,350])
pic('evidence/screenshots/10-resolved.png','Figure 3. Resident-visible report history after staff updates. “Demo update” wording distinguishes test data from real barangay action.')
page();h('7. Problems found and revisions made')
table(['ID / source','Issue','Change and verification'],[
['R01 / browser smoke test','The initial browser run could not reach the login screen. A malformed template-string delimiter in the review screen caused a JavaScript parse error.','Corrected the delimiter; node --check passed; reran the workflow and obtained 13 browser passes with no uncaught page errors. See browser-first-run.txt and browser-results.json.'],
['R04 / guided same-browser demo','After resident registration and sign-out, the registration tab remained selected, interrupting sign-in as staff.','Reset the authentication view to sign-in on logout. Added B13 and verified resident-to-staff switching in the same browser.'],
['R02 / evidence review','The test runner’s summary included the parent test, which could be mistaken for an additional functional scenario.','Saved a TAP report with stable F01–F20 identifiers and explained why the summary contains 21 passes.'],
['R03 / presentation preparation','The automated browser recording was too fast to explain the workflow comfortably.','Added a separate guided capture with deliberate reading pauses and both resident and staff actions. This is a presentation improvement, not user feedback.']], [100,190,210])
p('No quotations, satisfaction scores, participant counts or user-requested fixes have been invented. The revisions above came from developer verification and evidence review. Additional revision rows should be added only after an actual problem has been observed, a change made, and its retest result recorded.')
h('8. Remaining bugs, limitations and next steps')
p('No unresolved failure was observed in the 33 named automated checks after the fix. This does not establish that the application is bug-free. The following limitations are known and should be disclosed during the demonstration.')
table(['Area','Remaining limitation / next step'],[
['User validation','Recruit three representative participants, execute the tasks, retain feedback, prioritize findings and retest improvements.'],
['Deployment','Local classroom app only; no real barangay connection, dispatching, service-level promise or production hosting.'],
['Accounts','No OTP/mobile verification, password recovery or staff-account management interface.'],
['Data handling','No submitted-report editing/deletion, retention policy, backup/restore workflow, or photo metadata stripping. Raw photo content is not comprehensively decoded/scanned.'],
['Drafts and updates','Draft survives in-page navigation and network failure, but refresh clears it. Updates require refresh; no SMS/push notifications.'],
['Location and compatibility','GPS depends on permissions and a secure context. Manual location remains available. Test actual phones and other browsers next.'],
['Production robustness','Add pagination, deployment-specific rate limiting/session hardening, moderation, auditing and a formal security/accessibility review before public use.']], [105,395])
page();h('9. Representative-user testing plan — not yet executed')
p('Purpose: determine whether intended users can submit a complete report, understand identity withholding, find their reference and interpret status updates without unnecessary assistance. Proposed participants: P01, a resident comfortable with smartphone apps; P02, a resident with less digital experience or an older adult who uses a phone; P03, a barangay staff member or a suitable instructor-approved staff-role representative. Record the basis for each participant’s representativeness.')
p('Procedure: explain the classroom-only setting, obtain consent for notes or recording, use fictional incidents, and let each participant attempt tasks without coaching. Record completion, time, errors, assistance and verbatim comments. Do not collect passwords or unnecessary personal identifiers. Use participant codes in the report.')
table(['Task','Expected observable outcome'],[
['T01 / resident','Register/sign in and locate the reporting action.'],
['T02 / resident','Submit an empty form, interpret errors, and correct the required fields.'],
['T03 / resident','Enter a fictional concern and manual location; optionally add a photo and try GPS.'],
['T04 / resident','Explain the anonymous toggle, review details, edit a field, and submit once.'],
['T05 / resident','Find the reference number and explain the current status and timeline.'],
['T06 / staff','Find a report, post an in-progress update, and later resolve it with a clear note.'],
['T07 / resident after staff action','Refresh and correctly identify the latest update.']], [105,395])
p('Success targets (planned, not achieved user results): each resident completes the submit-and-track flow without a critical blocker; the staff participant updates a report successfully; participants understand that reports stay in a classroom demo and that identity withholding is limited. These are practical criteria for a small exploratory study, not a statistical usability claim.')
p('Feedback prompts: What was confusing? What did you expect after tapping Submit? What does anonymous mean here? Could you tell what happened to the report? What one change would make this easier? Record comments exactly, then record the team’s interpretation separately.')
p('Instructor-approved alternative: if three representative users are not available, submit this plan for written approval, agree on the replacement activities, perform those activities, and retain the approval plus execution evidence. A drafted plan alone does not meet the checklist requirement.')
p('After testing: complete the feedback and task sheets, prioritize critical/high/medium/low issues, implement justified changes, add dated revision-log rows with links to evidence, rerun affected tests, and update the checklist. Team contributions and any instructor approval should be confirmed by the team rather than assigned without evidence.')
# Markdown
md=[]
for kind,data in sections:
 if kind=='h':md.append('## '+data)
 elif kind=='p':md.append(data)
 elif kind=='table':
  headers,rows,_=data;md.append('| '+' | '.join(headers)+' |\n| '+' | '.join('---' for _ in headers)+' |\n'+'\n'.join('| '+' | '.join(row)+' |' for row in rows))
 elif kind=='pic':md.append(f'![{data[1]}](../{data[0]})')
(OUT/'BarangayReport-Part3.md').write_text('\n\n'.join(md))
# Editable Word
D=Document();sec=D.sections[0];sec.top_margin=Inches(.65);sec.bottom_margin=Inches(.65)
D.styles['Normal'].font.name='Calibri';D.styles['Normal'].font.size=Pt(10)
D.styles['Normal'].paragraph_format.space_after=Pt(7)
for kind,data in sections:
 if kind=='h':D.add_heading(data,0 if data.startswith('Part 3') else 1)
 elif kind=='p':D.add_paragraph(data)
 elif kind=='page':D.add_page_break()
 elif kind=='table':
  headers,rows,_=data;t=D.add_table(rows=1,cols=len(headers));t.style='Light Shading Accent 1'
  for c,hdr in zip(t.rows[0].cells,headers):c.text=hdr
  for row in rows:
   for c,text in zip(t.add_row().cells,row):c.text=text
  D.add_paragraph('')
 elif kind=='pic':D.add_picture(str(ROOT/data[0]),width=Inches(6));D.add_paragraph(data[1],style='Caption')
D.save(OUT/'BarangayReport-Part3.docx')
# PDF
styles=getSampleStyleSheet();styles['Title'].fontName='DejaVuSans-Bold';styles['Heading2'].fontName='DejaVuSans-Bold';styles.add(ParagraphStyle(name='BodyBR',fontName='DejaVuSans',fontSize=9,leading=13,spaceAfter=8));styles.add(ParagraphStyle(name='TableBR',fontName='DejaVuSans',fontSize=8,leading=10));styles.add(ParagraphStyle(name='CaptionBR',fontName='DejaVuSans-Oblique',fontSize=8,leading=11,spaceAfter=10));flow=[]
for kind,data in sections:
 if kind=='h':flow.append(Paragraph(html.escape(data),styles['Title'] if data.startswith('Part 3') else styles['Heading2']))
 elif kind=='p':flow.append(Paragraph(html.escape(data),styles['BodyBR']))
 elif kind=='page':flow.append(PageBreak())
 elif kind=='table':
  headers,rows,widths=data;values=[[Paragraph('<b>'+html.escape(x)+'</b>',styles['TableBR']) for x in headers]]+[[Paragraph(html.escape(x),styles['TableBR']) for x in row] for row in rows];t=Table(values,colWidths=widths,repeatRows=1,hAlign='LEFT');t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e6edf5')),('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),.35,colors.HexColor('#ccd6e2')),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]));flow.extend([t,Spacer(1,12)])
 elif kind=='pic':
  from PIL import Image as PI
  w,h=PI.open(ROOT/data[0]).size;flow.append(Image(str(ROOT/data[0]),width=490,height=490*h/w));flow.append(Paragraph(html.escape(data[1]),styles['CaptionBR']))
def footer(canvas,doc):
 canvas.setFont('DejaVuSans',8);canvas.setFillColor(colors.HexColor('#65758a'));canvas.drawString(48,27,'BarangayReport | Part 3 | Human-user testing pending');canvas.drawRightString(552,27,str(doc.page))
SimpleDocTemplate(str(OUT/'BarangayReport-Part3.pdf'),title='BarangayReport — Part 3: MVP Development and Testing',author='BarangayReport project team',pagesize=(612,792),leftMargin=50,rightMargin=50,topMargin=42,bottomMargin=43).build(flow,onFirstPage=footer,onLaterPages=footer)
# Spreadsheet templates
for file,headers,rows in [
 ('Participant-Tasks.csv',['participant_code','representative_role','date','device_browser','task_id','completed_yes_no','time_seconds','errors_observed','assistance_needed','evidence_file'],[[code,role,'','','','','','','',''] for code,role in [('P01','Resident / regular smartphone user'),('P02','Resident / less digital experience'),('P03','Barangay staff or approved representative')]]),
 ('User-Feedback.csv',['participant_code','date','task_id','verbatim_feedback','observer_note','severity','proposed_change','decision_and_reason','revision_id','retest_result'],[['P01','','','','','','','','',''],['P02','','','','','','','','',''],['P03','','','','','','','','','']]),
 ('Revision-Log.csv',['id','date','source','problem','change','verification','status'],[
 ['R01','2026-11-11','Browser smoke test','App stuck loading due to review-template parse error','Corrected template-string delimiter','Syntax check and all 13 browser checks passed','Implemented'],
 ['R04','2026-11-11','Guided demonstration','Registration tab remained active after sign-out','Reset auth mode to sign-in on logout','B13 regression check and guided demo passed','Implemented'],
 ['R02','2026-11-11','Evidence review','Parent test could be counted as an extra feature scenario','Saved TAP output and documented 20 child checks plus parent','20 named F01–F20 checks passed','Implemented'],
 ['R03','2026-11-11','Presentation review','Automated recording too fast for explanation','Separate guided recording with deliberate pauses','Guided MP4 decoded without errors; sampled caption frame inspected','Implemented']]),
 ('Functional-Test-Results.csv',['test_id','test_description','result','evidence'],[[i,t,'PASS','evidence/api-tests.tap'] for i,t in api]+[[x['id'],x['result'],x['status'],'evidence/browser-results.json'] for x in browser['checks']])]:
 with open(OUT/file,'w',newline='') as f:w=csv.writer(f,lineterminator="\n");w.writerow(headers);w.writerows(rows)
(OUT/'User-Testing-Plan.md').write_text('# User testing plan — pending execution\n\n'+'\n\n'.join(md[md.index('## 9. Representative-user testing plan — not yet executed')+1:]))
start=md.index('## 8. Remaining bugs, limitations and next steps');end=md.index('## 9. Representative-user testing plan — not yet executed');(OUT/'Limitations-and-Next-Steps.md').write_text('\n\n'.join(md[start:end]))
print('Report, editable Word file, PDF and test templates generated.')
