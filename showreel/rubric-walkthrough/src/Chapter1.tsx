import React from 'react';
import {Series,useVideoConfig} from 'remotion';
import {Beat} from './Design';
export const Chapter1=()=>{const {fps}=useVideoConfig();return <Series>
<Series.Sequence name="01 / A clear starting point" durationInFrames={360} premountFor={fps}><Beat index={3}/></Series.Sequence>
<Series.Sequence name="The current picture" durationInFrames={360} premountFor={fps}><Beat index={4}/></Series.Sequence>
<Series.Sequence name="Navigate with context" durationInFrames={330} premountFor={fps}><Beat index={5}/></Series.Sequence>
</Series>};
