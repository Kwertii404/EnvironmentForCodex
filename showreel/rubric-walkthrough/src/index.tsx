import React from 'react';
import {AbsoluteFill,Composition,registerRoot,Series,useVideoConfig,staticFile} from 'remotion';
import {Audio} from '@remotion/media';
import {Chapter0} from './Chapter0';
import {Chapter1} from './Chapter1';
import {Chapter2} from './Chapter2';
import {Chapter3} from './Chapter3';
import {Chapter4} from './Chapter4';
import {Chapter5} from './Chapter5';
import {Chapter6} from './Chapter6';
const Film=()=>{const {fps}=useVideoConfig();return <AbsoluteFill><Series>
<Series.Sequence name="Introduction" durationInFrames={750} premountFor={fps}><Chapter0/></Series.Sequence>
<Series.Sequence name="Login & dashboard" durationInFrames={1050} premountFor={fps}><Chapter1/></Series.Sequence>
<Series.Sequence name="Equipment CRUD" durationInFrames={2250} premountFor={fps}><Chapter2/></Series.Sequence>
<Series.Sequence name="Maintenance" durationInFrames={1050} premountFor={fps}><Chapter3/></Series.Sequence>
<Series.Sequence name="Accounts" durationInFrames={1050} premountFor={fps}><Chapter4/></Series.Sequence>
<Series.Sequence name="Implementation" durationInFrames={1350} premountFor={fps}><Chapter5/></Series.Sequence>
<Series.Sequence name="Team & recap" durationInFrames={900} premountFor={fps}><Chapter6/></Series.Sequence>
</Series><Audio src={staticFile("master.flac")} premountFor={fps}/></AbsoluteFill>};
registerRoot(()=> <><Composition id="LabTracker" component={Film} durationInFrames={8400} fps={30} width={1920} height={1080}/><Composition id="Chapter0" component={Chapter0} durationInFrames={750} fps={30} width={1920} height={1080}/><Composition id="Chapter1" component={Chapter1} durationInFrames={1050} fps={30} width={1920} height={1080}/><Composition id="Chapter2" component={Chapter2} durationInFrames={2250} fps={30} width={1920} height={1080}/><Composition id="Chapter3" component={Chapter3} durationInFrames={1050} fps={30} width={1920} height={1080}/><Composition id="Chapter4" component={Chapter4} durationInFrames={1050} fps={30} width={1920} height={1080}/><Composition id="Chapter5" component={Chapter5} durationInFrames={1350} fps={30} width={1920} height={1080}/><Composition id="Chapter6" component={Chapter6} durationInFrames={900} fps={30} width={1920} height={1080}/></>);
