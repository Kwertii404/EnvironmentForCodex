import json,subprocess,pathlib
root=pathlib.Path(__file__).resolve().parent.parent
j=json.load(open(root/'evidence/demo-timing.json'))
p=j.get('video')
if not p: raise SystemExit('Run test/demo.cjs first to capture new source video, then run this script.')
duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',p]))
def ass(t):
 cs=round(t*100);return f'{cs//360000}:{cs//6000%60:02}:{cs//100%60:02}.{cs%100:02}'
def srt(t):
 ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
header='''[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 980
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,DejaVu Sans,24,&H00FFFFFF,&H00FFFFFF,&H0010263F,&H0010263F,0,0,0,0,100,100,0,0,1,0,0,2,35,35,22,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
lines=[]
for i,stage in enumerate(j['stages']):
 start=stage['at'];end=j['stages'][i+1]['at'] if i+1<len(j['stages']) else duration
 header+=f"Dialogue: 0,{ass(start)},{ass(end)},Default,,0,0,0,,{stage['text']}\n"
 lines.append(f"{i+1}\n{srt(start)} --> {srt(end)}\n{stage['text']}\n")
(root/'evidence/demo-captions.ass').write_text(header);(root/'evidence/Walkthrough-Captions.srt').write_text('\n'.join(lines))
subprocess.run(['ffmpeg','-v','error','-i',p,'-vf','fps=30,pad=1280:980:0:0:color=0x10263f,ass=evidence/demo-captions.ass','-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart','-an','-y','evidence/BarangayReport-Guided-Walkthrough.mp4'],cwd=root,check=True)
# Replace test recording with the latest passing regression run.
b=json.load(open(root/'evidence/browser-results.json'))
subprocess.run(['ffmpeg','-v','error','-i',b['video'],'-vf','fps=30','-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart','-an','-y','evidence/BarangayReport-Functional-Walkthrough.mp4'],cwd=root,check=True)
print('Guided walkthrough:',round(duration,2),'seconds')
