import React from 'react';
import {interpolate,Easing} from 'remotion';
const ease={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const,easing:Easing.bezier(.16,1,.3,1)};
export const RevealText=({text,frame}:{text:string;frame:number})=><>{text.split(' ').map((w,i)=><span key={i} style={{display:'inline-block',overflow:'hidden',verticalAlign:'bottom',paddingBottom:5,marginRight:'.22em'}}><span style={{display:'inline-block',translate:`0 ${interpolate(frame,[i*3,i*3+24],[110,0],ease)}%`,opacity:interpolate(frame,[i*3,i*3+20],[0,1],ease)}}>{w}</span></span>)}</>;
const boxes:Record<number,[number,number,number,number]>={4:[274,116,1128,150],5:[6,96,224,262],7:[273,15,1127,140],8:[272,269,1130,173],9:[273,84,1128,317],11:[271,22,1131,166],14:[272,263,1130,152],15:[271,20,1130,152],16:[273,95,1127,125],17:[273,187,1127,168],18:[273,187,1127,168]};
export const FocusMark=({index,frame,duration}:{index:number;frame:number;duration:number})=>{
 const b=boxes[index];if(!b)return null;
 const t=frame-duration*.64;const perimeter=2*(b[2]+b[3]);
 return <svg viewBox="0 0 1440 810" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',opacity:interpolate(t,[0,12,Math.max(20,duration*.34)],[0,.85,0],ease)}}><rect x={b[0]} y={b[1]} width={b[2]} height={b[3]} rx={8} fill="none" stroke="#f2a93b" strokeWidth={4} strokeDasharray={perimeter} strokeDashoffset={interpolate(t,[0,40],[perimeter,0],ease)}/></svg>;
};
export const HeroFlow=({frame:f}:{frame:number})=><svg viewBox="0 0 360 450" style={{position:'absolute',left:1450,top:280,width:360,height:450,opacity:interpolate(f,[20,55],[0,1],ease)}}><path d="M 40 60 V 360" stroke="#c8d4df" strokeWidth="3"/><path d="M 40 60 V 360" stroke="#f2a93b" strokeWidth="5" strokeDasharray="18 85" strokeDashoffset={-f*1.6}/>{['RECORD','TRACK','RESOLVE'].map((s,i)=><g key={s} transform={`translate(0 ${i*150})`}><circle cx="40" cy="60" r="17" fill="#0f2a43"/><circle cx="40" cy="60" r="6" fill="#f2a93b"/><text x="85" y="67" fontSize="25" fill="#0f2a43" fontFamily="Arial" fontWeight="700" letterSpacing="3">{s}</text></g>)}</svg>;
export const CodeLines=({code,frame}:{code:string;frame:number})=>{
 const lines=code.split('\n');const active=Math.min(lines.length-1,Math.floor(frame/45));
 return <>{lines.map((line,i)=><div key={i} style={{opacity:interpolate(frame,[i*8,i*8+20],[0,1],ease),translate:`${interpolate(frame,[i*8,i*8+25],[24,0],ease)}px 0`,borderLeft:`3px solid ${i===active?'#f2a93b':'transparent'}`,paddingLeft:14,background:i===active?'#ffffff0c':'transparent'}}>{line||' '}</div>)}</>;
};
