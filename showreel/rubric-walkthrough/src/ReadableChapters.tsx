import React from 'react';
import {AbsoluteFill,Sequence,interpolate,Easing,useCurrentFrame,useVideoConfig} from 'remotion';
import {Chapter0} from './Chapter0';
import {Chapter1} from './Chapter1';
import {Chapter2} from './Chapter2';
import {Chapter3} from './Chapter3';
import {Chapter4} from './Chapter4';
import {Chapter5} from './Chapter5';
import {Chapter6} from './Chapter6';
const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const Card=({number,title}:{number:string;title:string})=>{const f=useCurrentFrame();return <AbsoluteFill style={{background:'#0f2a43',color:'white',fontFamily:'Arial, sans-serif',borderLeft:'18px solid #f2a93b',translate:`${interpolate(f,[84,105],[0,1920],{...clamp,easing:Easing.bezier(.65,0,.35,1)})}px 0`,display:'flex',flexDirection:'row',alignItems:'center',padding:100,gap:60}}>
<div style={{display:'flex',alignItems:'center',gap:60,opacity:interpolate(f,[0,9],[0,1],clamp),translate:`0 ${interpolate(f,[0,9],[20,0],clamp)}px`}}><span style={{fontSize:number.length>2?80:180,fontWeight:800,color:'#f2a93b'}}>{number}</span><span style={{fontSize:68,fontWeight:700}}>{title}</span></div>
</AbsoluteFill>};
const Section=({number,title,children}:{number:string;title:string;children:React.ReactNode})=>{const {fps}=useVideoConfig();return <AbsoluteFill style={{background:'#0f2a43'}}><Sequence from={2.5*fps} premountFor={fps}>{children}</Sequence><Sequence durationInFrames={3.5*fps} premountFor={fps}><Card number={number} title={title}/></Sequence></AbsoluteFill>};
export const Readable0=()=> <Section number="LABTRACKER" title="From records to maintenance"><Chapter0/></Section>;
export const Readable1=()=> <Section number="01" title="Login & dashboard"><Chapter1/></Section>;
export const Readable2=()=> <Section number="02" title="Equipment workflow"><Chapter2/></Section>;
export const Readable3=()=> <Section number="03" title="Maintenance tracking"><Chapter3/></Section>;
export const Readable4=()=> <Section number="04" title="Account management"><Chapter4/></Section>;
export const Readable5=()=> <Section number="05" title="Under the interface"><Chapter5/></Section>;
export const Readable6=()=> <Section number="06" title="The project team"><Chapter6/></Section>;
