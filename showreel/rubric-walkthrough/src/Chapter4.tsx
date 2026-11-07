import React from 'react';
import {Series,useVideoConfig} from 'remotion';
import {Beat} from './Design';
export const Chapter4=()=>{const {fps}=useVideoConfig();return <Series>
<Series.Sequence name="04 / Accounts with clear feedback" durationInFrames={330} premountFor={fps}><Beat index={16}/></Series.Sequence>
<Series.Sequence name="Create a sample technician" durationInFrames={390} premountFor={fps}><Beat index={17}/></Series.Sequence>
<Series.Sequence name="Control account availability" durationInFrames={330} premountFor={fps}><Beat index={18}/></Series.Sequence>
</Series>};
