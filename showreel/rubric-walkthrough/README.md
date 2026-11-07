# LabTracker — motion graphics revision

A 4:40, 1920×1080, 30 fps walkthrough built in Remotion using the real LabTracker interface.

[Download the revised MP4](https://github.com/Kwertii404/EnvironmentForCodex/raw/refs/heads/main/showreel/rubric-walkthrough/LabTracker-Walkthrough.mp4) · [Subtitles](LabTracker.srt) · [Narration script](Narration-Script.md)

## Changes in this revision

- One consistent Kokoro `am_michael` narrator, with measured sentence timing and an updated music ducking envelope.
- “The people behind the project” credits: Jacinth Dhane Mendoza — Main Developer; Jerico Teologo — UI/UX Design; Shena May Gadon — Database Design & Data Management.
- The additional roles were selected at the user's request as credit-role assignments. They are not independently verified claims about historical contributions.
- Stronger chapter wipes, word reveals, UI camera moves, animated focus outlines, workflow steps, code highlights and moving schema connectors.
- Removed presentation-assignment wording and the on-screen draft labels.

## Edit and render

```sh
npm ci
npm run studio
npm run render
```

The complete timeline is `src/index.tsx`. Each chapter has a separate component. Shared graphics are in `src/Design.tsx` and motion components are in `src/Motion.tsx`. The `public/` folder contains everything required for ordinary rendering: prepared real-UI clips, screenshots, narration clips, instrumental music and the mastered mix.

`story.json` is the narration source; `timing.json` contains measured cue timing; `LabTracker.srt` provides standalone subtitles. `voice.py` and `score.py` are optional regeneration scripts. Voice regeneration requires kokoro-onnx and the model paths configured in `voice.py`; included audio means that setup is unnecessary for standard editing.

All demonstration records are sample data. The app's source-backed implementation details are not a comprehensive security audit. Synthetic narration does not establish the rubric's requirement for actual member participation.

In this Git repository, the mastered mix and instrumental are stored as lossless FLAC. When regenerating audio, convert the resulting master to `public/master.flac`.
