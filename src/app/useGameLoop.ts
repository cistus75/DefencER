import { useEffect } from 'react'
import type { GameAction } from '../game/application/game-action'
export const useGameLoop=(phase:string,dispatch:(action:GameAction)=>void)=>useEffect(()=>{if(phase!=='combat')return;let frame=0,last=performance.now(),accumulator=0;const loop=(now:number)=>{accumulator+=Math.min(.1,(now-last)/1000);last=now;while(accumulator>=1/60){dispatch({type:'TICK',delta:1/60});accumulator-=1/60}frame=requestAnimationFrame(loop)};frame=requestAnimationFrame(loop);return()=>cancelAnimationFrame(frame)},[phase,dispatch])
