import type { CardDefinition } from '../domain/card'
export const cardDefinitions: Record<string, CardDefinition> = {
 'free-clone':{id:'free-clone',kind:'규칙',title:'자유 복제',subtitle:'다음 3회',description:'다음 3회 복제 비용이 0이 됩니다.',accent:'#5eabb7'},
 'outer-tactics':{id:'outer-tactics',kind:'규칙',title:'외곽 전술',subtitle:'외곽 +20%',description:'외곽 슬롯 피해 +20%, 안쪽 슬롯 피해 -15%',accent:'#b7a262'},
 'inner-tactics':{id:'inner-tactics',kind:'규칙',title:'중앙 전술',subtitle:'안쪽 +25%',description:'외곽 슬롯 피해 -10%, 안쪽 슬롯 피해 +25%',accent:'#b7a262'},
 'cube-watch':{id:'cube-watch',kind:'아이템',title:'큐브 워치',subtitle:'공격 속도 +18%',description:'기본 공격 속도가 18% 증가합니다.',accent:'#b7a262'},
 radar:{id:'radar',kind:'아이템',title:'레이더',subtitle:'사거리 +20%',description:'기본 공격과 스킬 탐색 사거리가 증가합니다.',accent:'#809fb0'},
 'power-module':{id:'power-module',kind:'아이템',title:'파워 모듈',subtitle:'공격력 +20%',description:'공격력이 20% 증가합니다.',accent:'#c77d58'},
}
