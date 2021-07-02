import { readFile } from 'fs/promises';
import { basename, resolve, normalize } from 'path';

export default function manifestJson (opts) {
  let manifestData = {};
  return {
    name: 'manifest-json',
    resolveId (source) {
      if (source === 'app/manifest.json') {
        return source;
      }
      return null;
    },
    load (id) {
      if (id === 'app/manifest.json') {
        return 'export default "This is virtual!"'; // the source code for "virtual-module"
      }
      return null; // other ids should be handled as usually
    },
    async buildStart () {
      const { input, manifest } = opts;

      if (!input) {
        throw new Error('Is the `input` option set to something?');
      }

      if (input) {
        this.addWatchFile(input);
        manifestData = JSON.parse(await readFile(resolve(input), 'utf-8'));
      } else {
        manifestData = {};
      }

      Object.assign(manifestData, JSON.parse(JSON.stringify(manifest)));

      if (manifestData.icons) {
        for (const icon of manifestData.icons) {
          icon.referenceId = this.emitFile({
            type: 'asset',
            source: await readFile(resolve(icon.src)),
            fileName: `manifest_icon_${basename(icon.src)}`
          });
          this.addWatchFile(resolve(icon.src));
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
