import json,numpy as np,soundfile as sf,subprocess
T=json.load(open('timing.json'));sr=32000;n=int(T['frames']/30*sr);out=np.zeros((n,2),np.float32);rng=np.random.default_rng(2026);beat=60/108
chords=[[146.832,184.997,220,277.183,329.628],[110,138.591,164.814,220,246.942],[92.499,110,138.591,164.814,207.652],[123.471,155.563,184.997,246.942,277.183]]
def add(sec,a,gain=1,pan=0):
 s=int(sec*sr);start=max(0,s);e=min(n,s+len(a));a=a[start-s:e-s]
 if e>start:
  out[start:e,0]+=a*gain*np.sqrt((1-pan)/2);out[start:e,1]+=a*gain*np.sqrt((1+pan)/2)
def keys(f,d):
 t=np.arange(int(d*sr))/sr
 return (np.sin(2*np.pi*f*t+1.6*np.exp(-t*4)*np.sin(2*np.pi*f*2*t))+.18*np.sin(2*np.pi*f*3*t)*np.exp(-t*4))*np.exp(-t*1.4)*np.minimum(t/.008,1)
for bar in range(int(n/sr/(4*beat))+1):
 at=bar*4*beat;ch=chords[(bar//2)%4];scene=max(0,sum(s['from']/30<=at for s in T['scenes'])-1);quiet=scene in [0,5,9]
 # wide, gently chorused pad
 t=np.arange(int(4.3*beat*sr))/sr;env=np.minimum(t/.3,1)*np.minimum(np.maximum((4.3*beat-t)/.7,0),1)
 for k,f in enumerate(ch):
  a=(np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*f*1.003*t))*.012*env;add(at,a,pan=(k-2)*.22)
 # syncopated electric piano chord stabs
 for step in [0,1.75,3]:
  for k,f in enumerate(ch):
   a=keys(f*2,1.5)*.035;add(at+step*beat,a,pan=(k-2)*.2);add(at+(step+.75)*beat,a*.2,pan=-(k-2)*.2)
 for b in range(4):
  when=at+b*beat;t=np.arange(int(.38*sr))/sr
  if not quiet or b in [0,2]:
   add(when,np.sin(2*np.pi*(47*t+3*(1-np.exp(-t*35))))*np.exp(-t*15)*.22)
  t=np.arange(int(.35*sr))/sr;f=ch[0]/2
  add(when,(np.sin(2*np.pi*f*t)+.18*np.sin(2*np.pi*f*2*t))*np.exp(-t*8)*.1)
  if b in [1,3] and not quiet:
   t=np.arange(int(.14*sr))/sr;noise=rng.standard_normal(len(t));noise=np.concatenate(([0],np.diff(noise)))
   add(when,(noise*.035*np.exp(-t*35)+np.sin(2*np.pi*185*t)*.045*np.exp(-t*30)))
  for h in range(2 if not quiet else 1):
   t=np.arange(int(.05*sr))/sr;noise=rng.standard_normal(len(t));noise=np.concatenate(([0],np.diff(noise)))
   add(when+h*.5*beat+(h*.025),noise*np.exp(-t*95)*.017,pan=.4 if h else -.4)
 # small, memorable melodic hook; alternate answers, leave room for the voice
 if not quiet and bar%4 in [2,3]:
  for j,degree in enumerate([2,4,3,1]):
   a=keys(ch[degree]*4,.7)*.018;add(at+j*beat,a,pan=.25);add(at+(j+.75)*beat,a*.35,pan=-.4)
# scene-aligned uplifts and downbeat accents
for s in T['scenes'][1:]:
 at=s['from']/30;t=np.arange(int(.65*sr))/sr;noise=rng.standard_normal(len(t));noise=np.convolve(noise,np.ones(12)/12,'same')
 add(at-.65,noise*np.linspace(0,1,len(t))**2*.08);add(at,keys(880,.9)*.025,pan=.3)
fade=np.minimum(np.arange(n)/(sr*1.2),1)*np.minimum((n-np.arange(n))/(sr*2),1);out*=fade[:,None]
rms=np.sqrt(np.mean(out*out));out*=.1/max(rms,1e-5);out=np.tanh(out)
sf.write('public/music.wav',out,sr)
# measured narration placement and ducked score
voice=np.zeros((n,2),np.float32);duck=np.full(n,.62,np.float32)
for scene in T['scenes']:
 for c in scene['cues']:
  subprocess.run(['ffmpeg','-v','error','-i','public/'+c['file'],'-af','highpass=f=85,equalizer=f=3200:t=q:w=1:g=1.8,acompressor=threshold=0.14:ratio=2.5:attack=8:release=90','-ar',str(sr),'-y','/tmp/vo-master.wav'],check=True)
  a,r=sf.read('/tmp/vo-master.wav',dtype='float32');s=round((scene['from']+c['start'])/30*sr);e=min(n,s+len(a));voice[s:e]+=a[:e-s,None]*1.25
  duck[s:e]=.21;ra=int(.15*sr);re=int(.35*sr);duck[max(0,s-ra):s]=np.linspace(.62,.21,min(ra,s));duck[e:min(n,e+re)]=np.linspace(.21,.62,min(re,n-e))
 # quiet tail, but let the score connect the scenes
mix=out*duck[:,None]+voice
sf.write('out/mix.wav',mix,sr)
print('Score and ducked mix ready',n/sr,flush=True)
