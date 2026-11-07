import React from 'react';
import {Series,useVideoConfig} from 'remotion';
import {Beat} from './Design';
export const Chapter5=()=>{const {fps}=useVideoConfig();return <Series>
<Series.Sequence name="05 / Look beneath the interface" durationInFrames={360} premountFor={fps}><Beat index={19}/></Series.Sequence>
<Series.Sequence name="Checks in the request path" durationInFrames={330} premountFor={fps}><Beat index={20}/></Series.Sequence>
<Series.Sequence name="Five tables. Connected records." durationInFrames={360} premountFor={fps}><Beat index={21}/></Series.Sequence>
<Series.Sequence name="Access checked after logout" durationInFrames={300} premountFor={fps}><Beat index={22}/></Series.Sequence>
</Series>};
