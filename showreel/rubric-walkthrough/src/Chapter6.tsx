import React from 'react';
import {Series,useVideoConfig} from 'remotion';
import {Beat} from './Design';
export const Chapter6=()=>{const {fps}=useVideoConfig();return <Series>
<Series.Sequence name="Records \u2192 maintenance \u2192 administration" durationInFrames={330} premountFor={fps}><Beat index={23}/></Series.Sequence>
<Series.Sequence name="The presentation team" durationInFrames={390} premountFor={fps}><Beat index={24}/></Series.Sequence>
<Series.Sequence name="LABTRACKER" durationInFrames={180} premountFor={fps}><Beat index={25}/></Series.Sequence>
</Series>};
