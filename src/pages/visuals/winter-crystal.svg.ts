import { crystalSvg } from '../../lib/crystal-geometry';
export const prerender = true;
export function GET() {
  return new Response(crystalSvg(), { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
}
