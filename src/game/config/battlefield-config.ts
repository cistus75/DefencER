import type { Vec2 } from '../domain/common'
export const slotOrigins: Vec2[] = [[309,307],[463,307],[615,307],[766,307],[918,309],[307,452],[463,452],[615,452],[766,452],[923,452],[302,593],[461,593],[613,593],[767,593],[928,593],[298,738],[458,738],[612,738],[768,738],[932,739]].map(([x,y]) => ({x,y}))
export const slotCenter = (slot: number): Vec2 => ({ x: slotOrigins[slot].x + 63, y: slotOrigins[slot].y + 54 })
export const slotShape: [number,number][] = [[10,0],[116,0],[126,9],[126,99],[116,108],[10,108],[0,99],[0,9]]
export const trackPoints: Vec2[] = [{x:255,y:208},{x:1110,y:208},{x:1148,y:246},{x:1171,y:885},{x:1110,y:939},{x:255,y:939},{x:190,y:875},{x:213,y:265},{x:255,y:208}]
const lengths = trackPoints.slice(1).map((p,i) => Math.hypot(p.x-trackPoints[i].x,p.y-trackPoints[i].y))
export const trackLength = lengths.reduce((a,b)=>a+b,0)
export const pointOnTrack = (distance: number): Vec2 => { let remaining = ((distance % trackLength)+trackLength)%trackLength; for (let i=0;i<lengths.length;i+=1) { if (remaining <= lengths[i]) { const a=trackPoints[i], b=trackPoints[i+1], t=remaining/lengths[i]; return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t} } remaining -= lengths[i] } return trackPoints[0] }
