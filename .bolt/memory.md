# Project memory

## Product intent & audience

- Personal/event website (name: "Ucapan Alya dava" — likely a celebratory greeting page, Indonesian context)
- Static site with photos, background music, and custom scripts
- Audience: personal invite/greeting recipients

## Brand personality & voice

- Warm, celebratory, personal tone

## Visual design & UX direction

- Includes a photo gallery (6 photos) and background music (auto-play audio asset)
- Custom JavaScript for interactivity (was non-module script, now bundled as ES module)
- Existing design and functionality must be preserved — no rebuilds from scratch

## Decisions, constraints & rationale

- Framework: Vite (vanilla, no React/Vue)
- Project structure: website content lives in a subfolder (e.g. `Ucapan Alya dava/`), not at project root
- Vite `build.outDir` must be anchored to project root `dist` (absolute path) because relative resolution puts output inside the website subfolder where Vite's `root` is set
- Audio/music asset must be explicitly copied into the build output (not automatically included by Vite)
- Script tag must use `type="module"` so Vite bundles the JS properly
- Publisher expects `dist/` at project root — any nested dist folders cause publish failure
- Rule: never rebuild the site from scratch or remove existing content; only adjust build config
- Rule: do not claim publish is fixed until `dist` exists and is verified

## Open questions & assumptions

- Assuming Vite config uses `root` pointing at the website subfolder; if project structure changes, `outDir` anchoring may need revisiting
- Unknown whether additional assets (beyond the 6 photos and one music file) may be added later; asset-copy logic may need extending