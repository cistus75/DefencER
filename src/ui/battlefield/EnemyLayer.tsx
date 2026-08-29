import type { EnemyInstance } from '../../game/domain/enemy'
import { pointOnTrack } from '../../game/config/battlefield-config'
export const EnemyLayer=({enemies}:{enemies:EnemyInstance[]})=><div className="enemy-layer">{enemies.map(enemy=>{const p=pointOnTrack(enemy.trackDistance);return <div key={enemy.id} className={`enemy enemy--${enemy.definitionId}`} style={{transform:`translate(${p.x}px,${p.y}px)`}}><i style={{width:`${enemy.hp/enemy.maxHp*100}%`}}/></div>})}</div>
