import React from 'react';
import {Series,useVideoConfig} from 'remotion';
import {Beat} from './Design';
export const Chapter0=()=>{const {fps}=useVideoConfig();return <Series>
<Series.Sequence name="One laboratory. Many details." durationInFrames={240} premountFor={fps}><Beat index={0}/></Series.Sequence>
<Series.Sequence name="From scattered notes" durationInFrames={270} premountFor={fps}><Beat index={1}/></Series.Sequence>
<Series.Sequence name="LABTRACKER" durationInFrames={240} premountFor={fps}><Beat index={2}/></Series.Sequence>
</Series>};
