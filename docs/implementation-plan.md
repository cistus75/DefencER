# DefencER 1~10라운드 프로토타입 구현 명세

이 문서는 DefencER의 현재 디자인 목업을 실제 플레이 가능한 1~10라운드 프로토타입으로 교체하기 위한 단일 구현 기준이다. 구현자는 이 문서에 적힌 구조, 수치, 상태 전이, 예외 처리, UI 동작을 그대로 사용하며 별도의 제품·기술 결정을 임의로 추가하지 않는다.

## 1. 구현 결과와 범위

완성되는 플레이 흐름은 다음과 같다.

```text
새 런 시작
→ 크레딧 100 지급
→ 전투 시작 전에 복제·이동·교환·합성·폐기
→ 1라운드 시작
→ 1~4라운드 자동 진행
→ 5라운드 종료 후 카드 3장 중 1장 선택
→ 아이템 카드면 장착 대상 선택
→ 6~9라운드 자동 진행
→ 10라운드 알파전
→ 알파 처치 시 승리
```

패배 조건은 필드 적이 정확히 50마리가 되는 순간과 10라운드 60초 안에 알파를 처치하지 못한 순간이다.

다음은 범위에서 제외한다.

- 11~40라운드, 오메가·감마·위클라인·히든 라운드
- 두 번째 이후 카드 선택과 카드 선택 타이머
- 모바일, 일시정지 버튼, 배속, 사운드
- 서버, 로그인, 랭킹, 로컬 저장, 영구 성장
- 적 특수 능력과 보스 고유 기믹

규칙 충돌 시 `CONTEXT.md`, ADR 0004, 나머지 ADR, `docs/game-design.md`, 본 문서, 현재 목업 코드 순으로 우선한다. 현재 목업의 초기 실험체 4명, 크레딧 350, 순환 복제, ROUND 01/02 카드 기록, 방어 안정도 72%, 00:18 타이머는 예시 데이터이므로 제거한다. 현재 목업의 3열 HUD, 연구시설 팔레트, 배경, 슬롯 좌표, 카드 오버레이와 패널 디자인은 보존한다.

## 2. 기술 및 의존성 원칙

- React 19, TypeScript, Vite를 유지한다.
- Vitest, jsdom, React Testing Library, jest-dom, user-event만 테스트 의존성으로 추가한다.
- Redux, Zustand, XState, Phaser, PixiJS, Matter.js, Tailwind, CSS-in-JS, UUID/RNG 패키지는 추가하지 않는다.
- 배경과 슬롯은 HTML/SVG, 실험체·적·투사체는 DOM과 CSS transform으로 렌더링한다.
- 게임 상태는 `useReducer`, 게임 루프는 `requestAnimationFrame`과 1/60초 고정 스텝을 사용한다.
- `domain`은 React·DOM·구체 설정을 참조하지 않는다. `config`는 domain 타입을 구현하고, `simulation`은 domain 인터페이스만 사용하며, `application`은 상태 전이를 조합한다. `app`만 구체 config와 RNG를 조립한다.
- reducer에서 `Math.random()`과 엔티티 ID용 `Date.now()`를 사용하지 않는다.
- 동일 seed와 action/tick 순서는 동일한 결과를 만들어야 한다.

## 3. 최종 파일 구조

```text
src/
├── main.tsx
├── App.tsx
├── styles.css
├── app/
│   ├── GameProvider.tsx
│   ├── game-context.ts
│   ├── useGameState.ts
│   ├── useGameCommands.ts
│   └── useGameLoop.ts
├── game/
│   ├── domain/
│   │   ├── common.ts
│   │   ├── game-config.ts
│   │   ├── run-state.ts
│   │   ├── unit.ts
│   │   ├── enemy.ts
│   │   ├── projectile.ts
│   │   ├── card.ts
│   │   ├── round.ts
│   │   ├── effects.ts
│   │   ├── ports/random-generator.ts
│   │   └── rules/
│   │       ├── board-rules.ts
│   │       ├── economy-rules.ts
│   │       ├── stat-rules.ts
│   │       ├── targeting-rules.ts
│   │       ├── card-rules.ts
│   │       └── round-rules.ts
│   ├── config/
│   │   ├── provisional-balance.ts
│   │   ├── battlefield-config.ts
│   │   ├── unit-definitions.ts
│   │   ├── enemy-definitions.ts
│   │   ├── round-definitions.ts
│   │   ├── card-definitions.ts
│   │   └── default-game-config.ts
│   ├── infrastructure/seeded-random-generator.ts
│   ├── simulation/
│   │   ├── simulation-context.ts
│   │   ├── step-combat.ts
│   │   ├── spawn-system.ts
│   │   ├── enemy-movement-system.ts
│   │   ├── unit-action-system.ts
│   │   ├── projectile-system.ts
│   │   ├── damage-resolution.ts
│   │   ├── support-resolution.ts
│   │   ├── round-resolution-system.ts
│   │   └── skills/
│   │       ├── skill-handler.ts
│   │       ├── skill-registry.ts
│   │       ├── hyunwoo-skill.ts
│   │       ├── rio-skill.ts
│   │       ├── adina-skill.ts
│   │       └── leni-skill.ts
│   └── application/
│       ├── game-store-state.ts
│       ├── notification.ts
│       ├── game-action.ts
│       ├── game-reducer.ts
│       ├── create-initial-state.ts
│       ├── commands/
│       │   ├── clone-unit.ts
│       │   ├── resolve-board-drop.ts
│       │   ├── discard-unit.ts
│       │   ├── round-commands.ts
│       │   └── card-commands.ts
│       └── selectors/
│           ├── board-selectors.ts
│           ├── hud-selectors.ts
│           ├── detail-selectors.ts
│           └── card-selectors.ts
├── ui/
│   ├── GameScreen.tsx
│   ├── hooks/useGameUiState.ts
│   ├── hooks/useBoardDrag.ts
│   ├── battlefield/
│   │   ├── Battlefield.tsx
│   │   ├── PlacementBoard.tsx
│   │   ├── UnitActor.tsx
│   │   ├── EnemyLayer.tsx
│   │   ├── ProjectileLayer.tsx
│   │   └── RangeIndicator.tsx
│   ├── panels/
│   │   ├── CardHistoryPanel.tsx
│   │   ├── BattleInfoPanel.tsx
│   │   └── UnitDetailPanel.tsx
│   ├── hud/TopStatusBar.tsx
│   ├── hud/BottomActionBar.tsx
│   ├── cards/
│   │   ├── CardSelectionOverlay.tsx
│   │   ├── CardOption.tsx
│   │   └── ItemTargetPicker.tsx
│   ├── feedback/ToastRegion.tsx
│   ├── feedback/RunResultOverlay.tsx
│   └── shared/
│       ├── Icon.tsx
│       ├── CreditToken.tsx
│       └── format.ts
├── styles/
│   ├── tokens.css
│   ├── base.css
│   ├── layout.css
│   ├── battlefield.css
│   ├── panels.css
│   ├── cards.css
│   └── feedback.css
└── test/
    ├── setup.ts
    ├── state-builders.ts
    └── game-flow.integration.test.tsx

docs/architecture.md
scripts/prepare_unit_assets.py
public/units/hyunwoo.webp
public/units/rio.webp
public/units/adina.webp
public/units/leni.webp
```

현재 import되지 않는 `alignment.css`, `battlefield-svg.css`, `lab-tone.css`는 이번 구현에서 임의로 삭제하지 않는다. 새 CSS 구조가 검증된 뒤 별도 정리 대상으로 보고한다.

## 4. 상태 모델

정의 ID는 다음 문자열로 고정한다.

```text
UnitDefinitionId: hyunwoo | rio | adina | leni
EnemyDefinitionId: normal | fast | alpha
SkillId: hyunwoo-strike | rio-barrage | adina-area | leni-mark
CardId: free-clone | outer-tactics | inner-tactics |
        cube-watch | radar | power-module
```

인스턴스 ID는 1부터 증가하는 정수이고 삭제 후 재사용하지 않는다. `RunState`는 phase, round, economy, units, enemies, projectiles, cards, activeRuleEffects, randomSeed, entityCounters, result를 가진다.

phase는 `ready | combat | card-selection | item-targeting | victory | defeat`로 고정한다. 허용 전이는 `ready→combat`, `combat→card-selection|victory|defeat`, `card-selection→combat|item-targeting`, `item-targeting→combat`, 결과 단계에서 reset을 통한 ready뿐이다.

초기 경제는 크레딧 100, 성공 복제 0, 무료 복제권 0, 리롤 3이다. 초기 라운드는 1, 일반, 30초, not-started이며 실험체·적·투사체·카드 기록은 비어 있다.

도메인 `RunState`와 application `GameStoreState`를 구분한다. `GameStoreState`는 `run`과 최대 5개의 code/payload notification queue를 가진다. 선택 실험체, drag, overlay 표시, 강조 카드와 토스트 표시 타이머는 UI state다.

## 5. 실험체와 성급

`UnitDefinition`은 이름, 역할, asset, 기본 공격력, 초당 공격, 사거리, 투사체 속도, skill ID/cooldown, 기본 지원 효율을 가진다. `UnitInstance`는 ID, definition ID, 슬롯, 성급, 아이템, 기본 공격/스킬 cooldown, 행동 잠금, 지원 표식을 가진다.

임시 수치는 다음으로 고정한다.

| 실험체 | 공격력 | 초당 공격 | 사거리 | 투사체 속도 | 스킬 |
|---|---:|---:|---:|---:|---|
| 현우 | 34 | 1.00 | 1.5 | 900 | 4초, 200% 단일 |
| 리오 | 18 | 1.35 | 3.5 | 1000 | 4초, 75% 3발 |
| 아디나 | 10 | 0.80 | 3.5 | 800 | 6초, 240% 범위 |
| 레니 | 7 | 0.90 | 2.5 | 850 | 8초, 표식 |

성급 계수는 1.00/1.20/1.40/1.60/1.80이며 5성에는 다시 1.30을 곱한다. 내부 소수는 유지하고 UI만 반올림한다. 성급은 공격력 또는 레니 지원 효율만 바꾸고 공격 속도, 사거리, 스킬 범위·대상 수·쿨타임은 바꾸지 않는다.

합성은 동일 definition·동일 1~4성일 때만 발생한다. 드롭 대상이 기준 실험체이며 ID·슬롯·아이템·지원 표식을 유지하고 star를 올린다. 재료는 아이템과 함께 소멸한다. 기준 cooldown은 기존 값과 새 최대 cooldown 중 작은 값을 유지한다. 5성끼리 드롭하거나 조건이 다르면 교환한다.

전투 중 이동한 source는 0.75초, 교환한 두 실험체는 모두 0.75초 행동 잠금이다. 준비 단계 조작에는 잠금이 없다. 잠금 중 cooldown은 감소하지만 공격·스킬만 발동하지 않는다. 전투 중 새 복제는 0.75초 잠금, 기본 공격 cooldown 0, 스킬 cooldown full로 시작한다.

## 6. 레니 지원

레니는 사거리 안 비서포터 중 하나를 seeded RNG로 균등 선택한다. 후보가 없으면 쿨타임을 소비하지 않는다. 표식은 4초이며 source Leni ID, 남은 시간, 생성 당시 지원 효율 snapshot을 저장한다.

지원 효율은 1성 0.20, 2성 0.24, 3성 0.28, 4성 0.32, 5성 0.468이다. 표식 대상의 기본 공격이 실제 적중할 때만 발동하며 스킬·지원 피해는 발동하지 않는다. 여러 표식은 `product(1 + ratio) - 1`로 합치고 0.80에서 제한한다. 추가 피해는 실제 기본 공격 적중 피해에 이 비율을 곱한다. 속도 1100의 곰돌이 투사체 하나를 만들고, 원래 적이 죽으면 소멸한다. 참여한 각 레니의 남은 스킬 cooldown을 0.25초 줄인다.

## 7. 적·라운드·트랙

기본 적은 HP 90, 속도 90, 보상 10, 크기 24px다. 빠른 적은 HP 70, 속도 150, 보상 15, 크기 20px다. 일반 적 HP는 `round(baseHp × (1 + 0.12 × (round - 1)))`이다. 알파는 HP 3200, 속도 70, 보상 100, 크기 56px다. 적끼리 충돌하지 않고 겹칠 수 있다.

라운드 1~9 적 수는 5~13으로 매 라운드 1씩 증가한다. 5라운드부터 spawn 순번 5의 배수인 적을 빠른 적으로 만든다. 일반 적은 0.3초마다 출현하고 첫 적도 0.3초 뒤에 나온다. 알파는 10라운드 시작 순간 즉시 필드에 추가한다.

기준 좌표계는 1374×1145다. 시계 방향 트랙 중심선은 다음 좌표를 잇는다.

```text
(255,208) → (1110,208) → (1148,246) → (1171,885)
→ (1110,939) → (255,939) → (190,875) → (213,265)
→ (255,208)
```

적은 `trackDistance`와 감소하지 않는 `travelledDistance`를 분리해 가진다. 한 바퀴에는 불이익이 없다. 좌표는 polyline segment 보간으로 계산한다.

라운드 정의는 다음과 같다.

| 라운드 | 종류 | 새 적 | 제한 |
|---:|---|---:|---:|
| 1~9 | 일반 | 5~13 | 30초 |
| 10 | 알파 | 1 | 60초 |

일반 라운드 종료 보상은 `50 + (round - 1) × 10`이다. 살아남은 적과 투사체는 다음 라운드로 유지한다. 필드와 queue가 모두 비면 스킵 버튼을 켜며 스킵은 시간 종료와 같은 성공·보상 경로를 사용한다. 5라운드 성공 후 카드 선택으로 정지한다. 알파 처치가 timeout과 같은 step에 발생하면 피해 처리가 먼저이므로 승리한다.

## 8. 슬롯·사거리·타기팅

슬롯은 행 우선 0~19이고 기존 20개 origin과 polygon을 `battlefield-config.ts`로 옮긴다. 외곽은 `0,1,2,3,4,5,9,10,14,15,16,17,18,19`, 안쪽은 `6,7,8,11,12,13`이다. 슬롯 중심은 origin에 `(63,54)`를 더한다.

1 range는 150px이다. 일반 타깃은 사거리 안 살아 있는 적 중 travelledDistance가 가장 크고, 동률이면 enemy ID가 작은 적이다. 알파가 사거리 안이면 일반 적보다 우선하며 사거리 밖이면 우선하지 않는다. 공격력·성급·아이템·규칙 효과는 투사체 생성 시 snapshot한다.

## 9. 투사체와 스킬

투사체는 source, target, attack kind, damage, speed, delay, area radius, visual kind, support trigger 여부를 가진다. 대상이 삭제되면 소멸하고 재타기팅하지 않는다. 도착 판정은 `distance <= speed × delta`다.

- 현우: 4초, 유효 공격력 200% 단일 투사체.
- 리오: 4초, 최초 대상에 75% 3발. delay 0/0.12/0.24초. 대상이 죽으면 남은 발도 소멸.
- 아디나: 6초, 최초 대상 도착 위치 중심 반경 90px, 240% 동일 범위 피해. 최초 대상이 도착 전 죽으면 소멸.
- 레니: 위 지원 규칙 사용.

스킬과 지원 투사체는 레니 표식을 발동하지 않는다.

## 10. 고정 simulation 순서

매 1/60초 step은 다음 순서를 바꾸지 않는다.

1. 라운드 시간, action lock, cooldown, mark, projectile delay 감소 및 0 clamp
2. 만료 표식 제거
3. 일반 spawn queue 소비
4. 필드 적 50 검사. 50이면 이후 계산 없이 즉시 패배
5. 적 이동
6. unit ID 순으로 스킬 시도 후 기본 공격 시도
7. projectile ID 순으로 이동과 적중 이벤트 생성
8. 적중 순으로 피해, 사망 표시, 중복 처치 방지
9. 기본 공격 적중의 레니 지원 처리
10. 죽은 적 제거와 보상
11. 알파 처치, 보스 timeout, 일반 라운드 종료 순으로 판정

대상이 없으면 기본/스킬 cooldown을 재설정하지 않는다. 스킬과 기본 공격 cooldown이 동시에 0이면 같은 step에 둘 다 발동할 수 있다. 50번째 적은 그 프레임에 공격으로 죽일 기회를 주지 않는다.

## 11. 복제·이동·폐기

복제 비용은 `10 + successfulCloneCount × 10`, 다음 비용은 현재 비용 +10이다. 성공 가능한지 슬롯→무료권→크레딧 순으로 확인하고 그 뒤에만 RNG를 소비한다. 무료 복제도 성공 횟수를 올린다. 실패는 비용·티켓·횟수·seed를 모두 유지한다. 복제 후보 순서는 현우, 리오, 아디나, 레니이고 `floor(random × 4)`로 동일 확률 선택한다. 행 우선 첫 빈 슬롯에 둔다.

드롭은 빈 슬롯이면 이동, 동일 definition·동일 1~4성이면 합성, 그 외 점유 슬롯이면 교환이다. source와 target이 같으면 notification 없이 종료한다.

폐기는 ready/combat에서만 가능하고 아이템 없는 1~4성만 허용한다. 크레딧·복제 횟수는 변하지 않는다.

## 12. 카드

규칙 카드:

- `free-clone`: 다음 무료 복제 3회. 티켓은 합산.
- `outer-tactics`: 외곽 피해 ×1.20, 안쪽 ×0.85.
- `inner-tactics`: 외곽 피해 ×0.90, 안쪽 ×1.25.

아이템 카드:

- `cube-watch`: 기본 공격 속도 ×1.18. 스킬 cooldown 불변.
- `radar`: 기본 공격과 스킬 대상 탐색 사거리 ×1.20. 범위 반경 불변.
- `power-module`: 공격력 ×1.20. 레니 지원 효율 불변.

모든 아이템은 모든 실험체에 장착 가능하고 교체·제거할 수 없다. 규칙과 아이템 효과는 round 6부터 적용한다. 카드 후보는 선택한 규칙을 제외하고, 장착 가능한 실험체가 없으면 모든 아이템을 제외한다. seeded Fisher–Yates로 shuffle한 뒤 앞 3장을 사용한다. 같은 제시 중복만 금지하며 리롤에서 직전 카드가 다시 나와도 된다.

카드 클릭은 강조만 하고 `카드 적용`으로 확정한다. 규칙은 즉시 히스토리 등록 후 round 6으로 간다. 아이템은 `item-targeting`으로 들어가며 대상 확정 후 round 6으로 간다. 아이템 적용을 확정한 뒤 카드 화면으로 돌아가거나 리롤할 수 없다. 오버레이 닫기는 표시만 숨기고 phase와 조작 잠금을 유지한다.

## 13. Action과 phase 권한

action은 `START_ROUND`, `TICK`, `CLONE_UNIT`, `MOVE_OR_MERGE`, `DISCARD_UNIT`, `SKIP_ROUND`, `CHOOSE_CARD`, `EQUIP_PENDING_ITEM`, `REROLL_CARDS`, `RESET_RUN`, `ACKNOWLEDGE_NOTIFICATION`이다.

- ready: start, clone, move, discard, reset, acknowledge
- combat: tick, clone, move, discard, 조건부 skip, reset, acknowledge
- card-selection: choose, reroll, reset, acknowledge
- item-targeting: equip, reset, acknowledge
- victory/defeat: reset, acknowledge

잘못된 phase action은 `interaction-locked` notification을 만들고 gameplay state는 바꾸지 않는다. TICK은 notification을 만들지 않는다.

## 14. Notification 문구

| 코드 | UI 문구 |
|---|---|
| clone-succeeded | `복제 완료 · {unitName} / SLOT {NN}` |
| no-empty-slot | `복제 중단 · 가용 슬롯 없음` |
| insufficient-credits | `복제 중단 · 보유 크레딧 부족` |
| unit-moved | `배치 이동 완료` |
| units-swapped | `위치 교환 완료` |
| units-merged | `합성 완료 · {unitName} {star}성` |
| unit-discarded | `폐기 완료 · {unitName} / 자원 회수 없음` |
| item-equipped | `폐기 불가 · 장착 아이템 보유` |
| max-star | `폐기 불가 · 5성 실험체` |
| interaction-locked | `현재 단계에서는 조작할 수 없습니다` |
| card-rerolled | `카드 제시 갱신 · 리롤 {remaining}회` |
| card-applied | `카드 적용 완료 · {cardTitle}` |
| item-attached | `아이템 장착 완료 · {unitName}` |
| round-skipped | `라운드 스킵 · 전장 정리 완료` |

토스트는 한 번에 하나, 3.4초, aria-live polite로 표시하고 종료 후 acknowledge한다.

## 15. UI 상태와 화면

`useGameUiState`는 selected unit, drag source/target/preview, card overlay visible, highlighted card를 관리한다. 선택 실험체가 사라지면 해제하고, 선택한 합성 재료가 사라지면 기준 실험체로 선택을 옮긴다. 카드 offer 변경 시 강조를 초기화하고 결과/reset 시 drag를 정리한다.

Ready 화면은 카드 기록 없음, 다음 ROUND 05, 리롤 03, 필드 적 0/50, ROUND 01/10, 전투 준비, 00:30, 전투 시작 버튼, 크레딧 100, 현재 10/다음 20을 보여준다. Combat은 실제 시간과 적 수를 표시한다. 카드 단계에는 BattleInfo에 `카드 선택 중`과 `카드 선택 열기`를 표시한다.

상단의 기존 방어 안정도는 `필드 적 N / 50`으로 교체한다. 0~39는 neutral/cyan, 40~49는 orange, 50은 red다. 하단 복제 버튼은 현재·다음 비용, 무료권, 크레딧을 표시하고 카드·결과 단계에서 비활성화한다.

드롭 preview는 이동 cyan, 합성 gold pulse, 교환 white, 불가 red muted다. 카드·결과 단계에는 drag를 시작할 수 없다.

승리 문구는 `실험 완료 / 알파 처치`, 패배 문구는 overflow면 `방어 한계 초과 / 필드 적이 50마리에 도달했습니다.`, timeout이면 `알파 제압 실패 / 제한 시간 안에 알파를 처치하지 못했습니다.`다. 결과에는 도달 라운드, 복제 횟수, 카드, 남은 크레딧, `새 런 시작`을 표시한다.

## 16. 파일 책임

- `App.tsx`: Provider와 GameScreen만 조합.
- `GameProvider.tsx`: reducer, config, RNG, command와 loop 조립.
- `useGameLoop.ts`: rAF, delta 최대 0.1초, 1/60 accumulator, combat tick.
- domain model 파일: 데이터 계약만 정의.
- rules 파일: 이름에 해당하는 순수 계산만 담당.
- config 파일: 확정/임시 수치와 정의. `provisional-balance.ts` 상단에 임시 밸런스임을 명시.
- `step-combat.ts`: 고정 순서 호출만 하고 세부 규칙을 구현하지 않음.
- simulation system 파일: 해당 시스템만 순수 상태 전이.
- skill 파일: 해당 실험체 스킬만 구현. `skill-registry` 외 이름별 조건문 금지.
- application command 파일: 하나의 사용자 transaction만 담당.
- reducer: action routing만 하고 규칙 직접 구현 금지.
- selectors: UI ViewModel만 만들고 상태 변경 금지.
- UI 컴포넌트: 좁은 props와 callback만 사용하고 config/reducer 직접 참조 금지.

## 17. 스타일과 에셋

현재 `styles.css` 규칙은 디자인 값을 바꾸지 않고 tokens/base/layout/battlefield/panels/cards/feedback으로 이동한다. `styles.css`는 import만 가진다. CSS 변수, 패널 치수, 배경 crop, 카드 크기, 현재 breakpoint를 유지한다.

`scripts/prepare_unit_assets.py`는 현우·리오·아디나·레니 SD 원본에서 가장자리 연결 흰 배경을 투명화하고, 가장 큰 connected component만 선택해 로고·하단 문구를 제거하고, padding 32인 정사각 캔버스에 중앙 배치 후 512×512 lossless WebP를 생성한다. 원본은 수정하지 않는다.

## 18. RNG

xorshift32를 사용한다. seed 0은 `0x9e3779b9`로 바꾸고 `[0,1)` value와 next seed를 반환한다. 새 런 seed는 Provider가 Date.now의 32bit 값으로 한 번 생성하고, 테스트는 고정 seed를 사용한다. RNG는 성공 가능한 복제, 카드 shuffle, 후보가 있는 레니 스킬에서만 소비한다.

## 19. 테스트

필수 단위 테스트:

- 복제 10/20/30/40 비용과 4회 후 크레딧 0, 실패 시 상태/seed 불변, 무료권 보존
- 행 우선 빈 슬롯, 외곽 14/안쪽 6, 이동·교환·합성·5성 교환
- 기준 아이템 유지와 재료 아이템 소멸, 폐기 제한
- 현우 2성 40.8, 5성 79.56, power module 40.8, radar 리오 4.2, cube watch 리오 1.593 APS
- 일반 spawn 0.3초, 누적 0.9초 3마리, r5 #5 fast, r6 #5/#10 fast
- 트랙 시계 방향, 한 바퀴 후 좌표 복귀와 travelled distance 유지
- 선두, tie-break, 보스 우선, 사거리 밖 보스 제외
- 죽은 target 투사체 소멸, 재타기팅 금지, 아디나 동일 범위 피해
- 레니 후보/seed/20·44·72.8·80% cap/비재귀/cooldown 감소
- r5 card phase, rule 재등장 제외, item 후보 제외, reroll 차감과 재등장 허용
- 50번째 spawn 즉시 패배 및 이후 공격 미실행
- 알파 처치 승리, 동일 step timeout보다 승리 우선, timeout 패배

통합 테스트는 ready→round1→round5→card→round6→alpha→victory와 49 enemies+1 spawn→defeat 두 흐름을 고정 seed·가상 시간으로 검증한다.

## 20. 구현 순서와 완료 기준

순서는 기준 스크린샷과 기존 build 확인, 테스트 설치, domain, config, rules/tests, RNG, initial/store, commands/reducer, simulation, skills, rounds, cards, Provider/loop, UI 분해, selectors 연결, SD 에셋, actor 렌더링, 카드 target picker, 결과 overlay, CSS 분리, 통합 테스트, build, 1920×1080 시각 QA, 관련 변경만 diff 검토 순으로 고정한다.

필수 명령은 다음이다.

```text
npm test
npm run typecheck
npm run build
```

1920×1080, zoom 100%에서 기존 목업과 패널 폭, 전장 crop, 하단 버튼, 우측 패널, 카드 overlay, 텍스트 줄바꿈을 비교한다. 적이 트랙 중심선을 따르고 SD가 슬롯 경계를 과도하게 침범하지 않아야 한다. 콘솔 오류와 React key 경고가 없어야 한다.

`CONTEXT.md`의 표준 용어인 복제, 폐기, 기준 실험체, 합성 재료, 배치판, 외곽 슬롯, 안쪽 슬롯, 필드 적을 코드·테스트·UI·문서에서 동일하게 사용한다. 요청과 관련 없는 코드는 수정하지 않는다.
