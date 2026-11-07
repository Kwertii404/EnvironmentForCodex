import json,re,os,subprocess
import numpy as np,soundfile as sf
from kokoro_onnx import Kokoro
k=Kokoro('/workspace/voice-models/kokoro-v1.0.onnx','/workspace/voice-models/voices-v1.0.bin')
rows=json.load(open('story.json'));timing=[];srt=[];idx=1
voices={'Narrator':'am_michael'}
def stamp(t):
 ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
for r in rows:
 parts=re.split(r'(?<=[.!?])\s+',r['text']);audio=[]
 for j,p in enumerate(parts):
  fn=f"public/vo-{r['id']}-{j}.wav"
  if os.path.exists(fn):a,sr=sf.read(fn,dtype='float32')
  else:a,sr=k.create(p,voice=voices[r['speaker']],speed=1.035,lang='en-us',sentence_pause=.16,clause_pause=.085);sf.write(fn,a,sr)
  audio.append((fn,a,sr,p))
 total=sum(len(a)/sr for _,a,sr,_ in audio)+.18*(len(audio)-1)
 available=r['end']-r['start']-1.05;ratio=max(1,total/available)
 pos=r['start']+.45;cues=[]
 for fn,a,sr,p in audio:
  if ratio>1:
   subprocess.run(['ffmpeg','-v','error','-i',fn,'-af',f'atempo={ratio}','-y',fn+'.wav'],check=True);os.replace(fn+'.wav',fn);a,sr=sf.read(fn,dtype='float32')
  dur=len(a)/sr;cues.append(dict(start=round((pos-r['start'])*30),duration=dur,file=os.path.basename(fn),text=p))
  srt.append(f'{idx}\n{stamp(pos)} --> {stamp(pos+dur)}\n{p}\n');idx+=1;pos+=dur+.18
 timing.append(dict(index=r['id'],**{'from':r['start']*30},frames=(r['end']-r['start'])*30,cues=cues))
 print(r['id'],round(total,2),'window',r['end']-r['start'],'tempo',round(ratio,2),flush=True)
json.dump(dict(frames=8400,fps=30,scenes=timing),open('timing.json','w'),indent=2)
open('LabTracker.srt','w').write('\n'.join(srt))
