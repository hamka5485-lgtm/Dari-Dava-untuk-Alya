import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const outDir = resolve(__dirname, 'dist');

export default defineConfig({
  root: 'Ucapan Alya dava',
  publicDir: false,
  build: {
    outDir,
    emptyOutDir: true
  },
  plugins: [
    {
      name: 'copy-audio-assets',
      closeBundle() {
        const audioDir = resolve(outDir, 'assets/audio');
        mkdirSync(audioDir, { recursive: true });
        copyFileSync(
          resolve(__dirname, 'Ucapan Alya dava/assets/audio/nuca-masa-ini-nanti-dan-masa-indah-lainnya-official-lyric-video-128-ytshorts.savetube.me.mp3'),
          resolve(audioDir, 'nuca-masa-ini-nanti-dan-masa-indah-lainnya-official-lyric-video-128-ytshorts.savetube.me.mp3')
        );
      }
    }
  ]
});
