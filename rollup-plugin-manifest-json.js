import { readFileSync } from 'fs';
import { basename, resolve, normalize } from 'path';

export default function manifestJson (opts) {
  let manifestData = {};
  return {
    name: 'manifest-json',
    buildStart () {
      const { input, manifest } = opts;

      if (!input) {
        throw new Error('Is the `input` option set to something?');
      }

      manifestData = JSON.parse(readFileSync(resolve(input), 'utf-8'));

      Object.assign(manifestData, JSON.parse(JSON.stringify(manifest || {})));

      if (manifestData.icons) {
        for (const icon of manifestData.icons) {
          icon.referenceId = this.emitFile({
            type: 'asset',
            source: readFileSync(resolve(icon.src)),
            fileName: `manifest_icon_${basename(icon.src)}`
          });
        }
      }
    },
    generateBundle () {
      const { minify, output } = opts;
      if (manifestData.icons) {
        for (const icon of manifestData.icons) {
          const referenceId = icon.referenceId;
          delete icon.referenceId;
          icon.src = this.getFileName(referenceId);
        }
      }
      this.emitFile({
        type: 'asset',
        source: minify ? JSON.stringify(manifestData) : JSON.stringify(manifestData, null, 2),
        fileName: output ? normalize(`${output}/manifest.json`) : 'manifest.json'
      });
    }
  };
}
