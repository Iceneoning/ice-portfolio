/** Original sixfold frost silhouette, shared by the static SVG and GLSL field. */
export interface CrystalBranch { a: [number, number]; b: [number, number]; width: number; }
export const crystalBranches: CrystalBranch[] = [
  { a: [0, 0.055], b: [0, 0.79], width: 0.044 },
  { a: [0, 0.16], b: [0.155, 0.315], width: 0.040 },
  { a: [0, 0.32], b: [0.192, 0.512], width: 0.034 },
  { a: [0, 0.485], b: [0.139, 0.66], width: 0.027 },
  { a: [0, 0.64], b: [0.062, 0.745], width: 0.016 },
];

export function crystalPolygon({ a, b, width }: CrystalBranch) {
  const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy);
  const nx = -dy / length * width, ny = dx / length * width;
  const shoulder: [number, number] = [a[0] + dx * 0.2, a[1] + dy * 0.2];
  return [a, [shoulder[0] + nx, shoulder[1] + ny], b,
    [shoulder[0] - nx, shoulder[1] - ny]].map((p) => `${(p[0]! * 380).toFixed(2)},${(-p[1]! * 380).toFixed(2)}`).join(' ');
}

export function crystalSvg() {
  const branches = crystalBranches.map((branch) => {
    const points = crystalPolygon(branch);
    const x = (branch.b[0] * 380).toFixed(2), y = (-branch.b[1] * 380).toFixed(2);
    const ax = (branch.a[0] * 380).toFixed(2), ay = (-branch.a[1] * 380).toFixed(2);
    const blade = `<polygon points="${points}" fill="url(#ice)" stroke="#deeff3" stroke-width=".7"/><path d="M${ax} ${ay}L${x} ${y}" stroke="#fffdf4" stroke-width=".9" opacity=".8"/>`;
    return blade + (branch.b[0] === 0 ? '' : `<g transform="scale(-1 1)">${blade}</g>`);
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" fill="none"><title>Winter Crystal — original sixfold frost crest</title><defs><linearGradient id="ice" x1="-70" y1="-300" x2="110" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="#f5fcfa"/><stop offset=".45" stop-color="#b1d6e4"/><stop offset="1" stop-color="#75a5bf"/></linearGradient><g id="arm">${branches}</g></defs><g transform="translate(400 400) rotate(12)">${[0,60,120,180,240,300].map((angle) => `<use href="#arm" transform="rotate(${angle})"/>`).join('')}<path d="M0-28 24-14V14L0 28-24 14V-14Z" fill="#e0f1f1" stroke="#fffef4" stroke-width="1.3"/><path d="M0-18 7-5 18 0 7 5 0 18-7 5-18 0-7-5Z" fill="#fffdf0"/></g></svg>`;
}
