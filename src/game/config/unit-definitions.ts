import type { UnitDefinition } from '../domain/unit'
export const unitDefinitions: Record<string, UnitDefinition> = {
  hyunwoo: { id:'hyunwoo',name:'현우',role:'근접',asset:'/units/hyunwoo.webp',attack:34,attacksPerSecond:1,range:1.5,projectileSpeed:900,skillId:'hyunwoo-strike',skillCooldown:4,supportRatio:0,color:'#c77d58' },
  rio: { id:'rio',name:'리오',role:'원거리',asset:'/units/rio.webp',attack:18,attacksPerSecond:1.35,range:3.5,projectileSpeed:1000,skillId:'rio-barrage',skillCooldown:4,supportRatio:0,color:'#66a8c4' },
  adina: { id:'adina',name:'아디나',role:'스킬',asset:'/units/adina.webp',attack:10,attacksPerSecond:.8,range:3.5,projectileSpeed:800,skillId:'adina-area',skillCooldown:6,supportRatio:0,color:'#a78ac9' },
  leni: { id:'leni',name:'레니',role:'서포터',asset:'/units/leni.webp',attack:7,attacksPerSecond:.9,range:2.5,projectileSpeed:850,skillId:'leni-mark',skillCooldown:8,supportRatio:.2,color:'#b1a15b' },
}
