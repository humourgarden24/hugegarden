# Kaal Darpan — museum development stage

This extends your original React home page with a bright modern Three.js gallery inspired by your reference image, three selectable monument miniatures, a teleport transition, orbit/zoom exploration, architecture hotspots, short timelines, two-question activities and local learning progress.

![Gallery preview](Gallery_Preview.png)

## Open it

Extract the ZIP and open the extracted project folder containing package.json in VS Code. In its terminal run:

    npm install
    npm run dev

Open http://localhost:5175 for the Kaal Darpan cover (React, mounted from `src/main.jsx`), then use **Enter the Museum** to pass through the clock transition into the gallery hall. Keep the terminal running. If port 5175 is already occupied by your old project, stop the old server with Ctrl+C first.

Use the **Light mode / Dark mode** control in the header to switch the interface theme. Your selection is saved in this browser. The cover's Hindi title uses Noto Sans Devanagari.

The downloaded ZIP intentionally excludes node_modules. npm install recreates it correctly for your computer.

## Gallery design

The gallery uses white rectangular display tables, a tiled stone-style floor, full-height windows, a dark slatted ceiling with perimeter lighting, wall-mounted heritage illustrations, benches and small object exhibits. Taj Mahal is on the central foreground table, Qutub Minar is further along the centre aisle, and Red Fort is on the left display table. The gallery is modeled in 3D; the reference photo is not used as a flat background.

Drag to look around within the room and scroll/pinch to move closer. Select a miniature, its display table, or the accessible monument card to enter that monument.

## Try it

Begin Exploration → select Taj Mahal, Qutub Minar or Red Fort → drag to rotate and scroll/pinch to zoom → select a numbered marker or feature button to zoom to that detail → optionally enter Visitor mode to walk with W/A/S/D → choose a weather atmosphere from the timeline controls → History → Challenge → answer both questions and check answers → return to Museum → My Journey.

The exhibit cards and feature buttons provide keyboard access to the same content as 3D clicking. Visitor mode is also available on the notes and quiz page; click the model to focus it, drag to look, use W/A/S/D to walk, and Shift to move faster. Visitor mode and weather controls sit beside the timeline. The weather selector offers sunrise and sunset skies with a glowing sun and tinted clouds, rain clouds with rainfall, a cloudy atmosphere, and a moonlit night sky with stars, a textured moon, and cool reflections. The monument grounds also include garden trees and greenery. Choose **Original lighting** to restore the default view. Reset View restores the camera. R also resets it when the canvas is focused.

## Scope

Models are simplified procedural learning placeholders, not measured reconstructions. This stage supports looking around the museum and orbiting monuments; walking through interiors, production Blender/GLB models, QR scanning, accounts, Firebase and AR/prism display are not implemented. Progress is stored in localStorage for the same browser and origin; it does not sync between devices. If storage is blocked the app remains usable for the session.

## Museum guide chatbot

The Gemini-powered guide uses the exhibit notes in `src/data.js` together with the keyword and intent guide in `server/chatbot_training_keywords.json`. The guide recognizes aliases, spelling variants, Hindi/Hinglish terms, question intents, and the dataset's disambiguation guidance. This is prompt-based grounding for Gemini, not model fine-tuning. The supplied file is a keyword index that refers to a separate 300-question answer document; that answer document is not included, so the chatbot must not invent unsupported answers.

Set `GEMINI_API_KEY` in a local `.env.local` file to enable chat, then restart the Vite server. The guide will not answer changing ticket, timing, or closure details from the keyword list; it directs visitors to the official ASI source.

## Files

- index.html: single Vite entry; mounts the React app (cover → hall → monument) from `src/main.jsx`.
- museum.html: thin redirect to `/` (keeps old links working; `museum.html#gallery` → `/#gallery` opens straight into the hall)
- src/App.jsx: entrance, navigation, transition, learning panels, quiz, progress
- src/Scene.jsx: renderer, controls, picking, projected markers, cleanup
- src/models.js: procedural monument and museum builders
- src/data.js: monument content, hotspots, quiz and source URLs
- src/App.css and src/index.css: styling

## References

Historical content was checked against UNESCO monument descriptions. Simplified model observations are explicitly marked. Content should be reviewed alongside measured assets before a full educational release.

- Taj Mahal: https://whc.unesco.org/en/list/252/
- Qutb Minar and its Monuments: https://whc.unesco.org/en/list/233/
- Red Fort Complex: https://whc.unesco.org/en/list/231/

## Build

    npm run build
    npm run lint

Node.js: use a version supported by the project's Vite dependency. The gallery does not need a database; the Gemini chatbot needs `GEMINI_API_KEY` as described above.
