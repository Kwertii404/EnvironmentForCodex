# LabTracker — IT16 rubric walkthrough

A 4:40 Remotion film using the latest cleaned application’s real UI, with Kokoro narration, an original instrumental score, motion graphics, and synchronized captions.

- [Watch/download the 1080p MP4](LabTracker-Walkthrough.mp4)
- [Narration and member speaking assignments](Narration-Script.md)
- [SRT subtitles](LabTracker.srt)
- [Storyboard](Storyboard.md)
- [Rubric coverage and limitations](Rubric-Coverage.md)
- [Export verification](Quality-Check.json)

## Edit or render

Install Node.js, then run from this directory:

```sh
npm ci
npm run studio
npm run render
```

The main composition is `src/index.tsx`; each chapter has its own component. `public/` includes all prepared application footage, screenshots, narration clips, the original instrumental, and the mastered audio. No PHP server, demo database, Kokoro model, or recording setup is needed to edit and render these included assets.

The mastered mix and instrumental use lossless FLAC to reduce repository size. The source-generation scripts are optional: `voice.py` needs kokoro-onnx and locally configured model paths; `score.py` generates WAV intermediates. Convert the mastered mix to `public/master.flac` after regenerating audio. These scripts are not needed for the standard render command.

## Content and participation

The film demonstrates login/dashboard, equipment CRUD, maintenance, account management, source-backed implementation details, and logout protection. All records shown are labeled sample data.

Kokoro voices are synthetic placeholders, not recordings or voice clones of the members. Jacinth Dhane Mendoza is the confirmed main developer. Jerico Teologo and Shena May Gadon have assigned presentation sections, which do not assert historical development contributions. The rubric’s actual member-participation requirement still needs genuine member involvement.

The export is 1920×1080, 30 fps, 8,400 frames, H.264/AAC. Full decoding and caption-window checks passed. The audio master measures −15.86 LUFS and −1.5 dBTP.

The large delivery ZIP, caches, dependencies, local credentials, and disposable demo database are excluded from Git. All assets needed for the included composition are tracked individually.
