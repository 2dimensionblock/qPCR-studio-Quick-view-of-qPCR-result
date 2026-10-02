import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const rows = [['Well', 'Sample', 'Gene', 'Group', 'Time', 'BioRep', 'Cq']];
const expected = [['Gene', 'Group', 'Time', 'n', 'Mean_2^-DeltaCt', 'SD', 'SEM']];
const times = [0, 12, 24, 48];
let well = 0;
for (const group of ['Control', 'Treatment']) {
  for (const [timeIndex, time] of times.entries()) {
    const values = [];
    for (let bio = 0; bio < 3; bio++) {
      const reference = 21.4 + [-0.06, 0.02, 0.04][bio] + timeIndex * 0.025 + (group === 'Treatment' ? 0.03 : 0);
      const delta = (group === 'Control' ? 5 : [5, 4.4, 3.6, 3][timeIndex]) + [-0.12, 0, 0.12][bio];
      values.push(2 ** -delta);
      for (const gene of ['Reference', 'GeneX']) {
        for (const direction of [-1, 1]) {
          const cq = reference + (gene === 'GeneX' ? delta + direction * 0.045 : direction * 0.035);
          const position = String.fromCharCode(65 + Math.floor(well / 12)) + ((well % 12) + 1);
          well++;
          rows.push([position, `${group}_${time}_R${bio + 1}`, gene, group, time, `R${bio + 1}`, cq.toFixed(3)]);
        }
      }
    }
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sd = Math.sqrt(values.reduce((a, x) => a + (x - mean) ** 2, 0) / (values.length - 1));
    expected.push(['GeneX', group, time, 3, mean.toPrecision(15), sd.toPrecision(15), (sd / Math.sqrt(3)).toPrecision(15)]);
  }
}
await mkdir(path.join(root, 'examples'), { recursive: true });
for (const [name, data] of [['synthetic_96_wells.csv', rows], ['synthetic_96_expected_summary.csv', expected]]) {
  await writeFile(path.join(root, 'examples', name), '\uFEFF' + data.map(r => r.join(',')).join('\r\n') + '\r\n');
}
console.log('Generated 96 synthetic wells and 8 biological summary points.');
