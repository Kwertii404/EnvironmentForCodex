import React from 'react';
import {Series,useVideoConfig} from 'remotion';
import {Beat} from './Design';
export const Chapter3=()=>{const {fps}=useVideoConfig();return <Series>
<Series.Sequence name="03 / Connect the repair work" durationInFrames={360} premountFor={fps}><Beat index={13}/></Series.Sequence>
<Series.Sequence name="Equipment and repair stay linked" durationInFrames={330} premountFor={fps}><Beat index={14}/></Series.Sequence>
<Series.Sequence name="Record the resolution" durationInFrames={360} premountFor={fps}><Beat index={15}/></Series.Sequence>
</Series>};
