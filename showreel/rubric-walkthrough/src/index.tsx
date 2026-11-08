import React from 'react';
import {AbsoluteFill,Composition,registerRoot,Series,useVideoConfig,staticFile} from 'remotion';
import {Audio} from '@remotion/media';
import {Readable0} from './ReadableChapters';
import {Readable1} from './ReadableChapters';
import {Readable2} from './ReadableChapters';
import {Readable3} from './ReadableChapters';
import {Readable4} from './ReadableChapters';
import {Readable5} from './ReadableChapters';
import {Readable6} from './ReadableChapters';
const Film=()=>{const {fps}=useVideoConfig();return <AbsoluteFill><Series>
<Series.Sequence name="Introduction" durationInFrames={825} premountFor={fps}><Readable0/></Series.Sequence>
<Series.Sequence name="Login & dashboard" durationInFrames={1125} premountFor={fps}><Readable1/></Series.Sequence>
<Series.Sequence name="Equipment CRUD" durationInFrames={2325} premountFor={fps}><Readable2/></Series.Sequence>
<Series.Sequence name="Maintenance" durationInFrames={1125} premountFor={fps}><Readable3/></Series.Sequence>
<Series.Sequence name="Accounts" durationInFrames={1125} premountFor={fps}><Readable4/></Series.Sequence>
<Series.Sequence name="Implementation" durationInFrames={1425} premountFor={fps}><Readable5/></Series.Sequence>
<Series.Sequence name="Team & recap" durationInFrames={975} premountFor={fps}><Readable6/></Series.Sequence>
</Series><Audio src={staticFile("master.flac")} premountFor={fps}/></AbsoluteFill>};
registerRoot(()=> <><Composition id="LabTracker" component={Film} durationInFrames={8925} fps={30} width={1920} height={1080}/><Composition id="Chapter0" component={Readable0} durationInFrames={825} fps={30} width={1920} height={1080}/><Composition id="Chapter1" component={Readable1} durationInFrames={1125} fps={30} width={1920} height={1080}/><Composition id="Chapter2" component={Readable2} durationInFrames={2325} fps={30} width={1920} height={1080}/><Composition id="Chapter3" component={Readable3} durationInFrames={1125} fps={30} width={1920} height={1080}/><Composition id="Chapter4" component={Readable4} durationInFrames={1125} fps={30} width={1920} height={1080}/><Composition id="Chapter5" component={Readable5} durationInFrames={1425} fps={30} width={1920} height={1080}/><Composition id="Chapter6" component={Readable6} durationInFrames={975} fps={30} width={1920} height={1080}/></>);
