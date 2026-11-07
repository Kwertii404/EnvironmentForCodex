import React from 'react';
import {Series,useVideoConfig} from 'remotion';
import {Beat} from './Design';
export const Chapter2=()=>{const {fps}=useVideoConfig();return <Series>
<Series.Sequence name="02 / Give every item a record" durationInFrames={420} premountFor={fps}><Beat index={6}/></Series.Sequence>
<Series.Sequence name="Saved. Ready to inspect." durationInFrames={300} premountFor={fps}><Beat index={7}/></Series.Sequence>
<Series.Sequence name="Find the same record" durationInFrames={330} premountFor={fps}><Beat index={8}/></Series.Sequence>
<Series.Sequence name="Details in one place" durationInFrames={270} premountFor={fps}><Beat index={9}/></Series.Sequence>
<Series.Sequence name="A meaningful update" durationInFrames={390} premountFor={fps}><Beat index={10}/></Series.Sequence>
<Series.Sequence name="The change is saved" durationInFrames={240} premountFor={fps}><Beat index={11}/></Series.Sequence>
<Series.Sequence name="Remove only the disposable sample" durationInFrames={300} premountFor={fps}><Beat index={12}/></Series.Sequence>
</Series>};
