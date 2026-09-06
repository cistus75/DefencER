import type { CardDefinition } from '../domain/card'
import type { CardId } from '../domain/common'
export const cardDefinitions: Record<CardId, CardDefinition> = {
 'free-clone':{id:'free-clone',kind:'규칙',title:'자유 복제',subtitle:'다음 3회',description:'다음 3회 복제 비용이 0이 됩니다.',accent:'#5eabb7'},
 'outer-tactics':{id:'outer-tactics',kind:'규칙',title:'외곽 전술',subtitle:'외곽 +20%',description:'외곽 슬롯 피해 +20%, 안쪽 슬롯 피해 -35%',accent:'#b7a262'},
 'inner-tactics':{id:'inner-tactics',kind:'규칙',title:'중앙 전술',subtitle:'안쪽 +150%',description:'외곽 슬롯 피해 -60%, 안쪽 슬롯 피해 +150%',accent:'#b7a262'},
 'concentrated-fire':{id:'concentrated-fire',kind:'규칙',title:'집중 화력',subtitle:'공격력 +15%',description:'모든 실험체의 공격력이 15% 증가합니다.',accent:'#c77d58'},
 'rapid-cycle':{id:'rapid-cycle',kind:'규칙',title:'고속 순환',subtitle:'공격 속도 +15%',description:'모든 실험체의 기본 공격 속도가 15% 증가합니다.',accent:'#6fa6b4'},
 'extended-sensors':{id:'extended-sensors',kind:'규칙',title:'확장 감지',subtitle:'사거리 +12%',description:'모든 실험체의 공격 탐색 사거리가 12% 증가합니다.',accent:'#809fb0'},
 'cube-watch':{id:'cube-watch',kind:'아이템',title:'큐브 워치',subtitle:'공격 속도 +18%',description:'기본 공격 속도가 18% 증가합니다.',accent:'#b7a262'},
 radar:{id:'radar',kind:'아이템',title:'레이더',subtitle:'사거리 +20%',description:'기본 공격과 스킬 탐색 사거리가 증가합니다.',accent:'#809fb0'},
 'power-module':{id:'power-module',kind:'아이템',title:'파워 모듈',subtitle:'공격력 +20%',description:'공격력이 20% 증가합니다.',accent:'#c77d58'},
}
