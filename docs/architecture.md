# DefencER MVP 아키텍처

## 의존성 방향

```text
domain ← config
   ↑        ↑
simulation │
   ↑        │
application│
   ↑        │
  app ──────┘
   ↑
  UI
```

- `domain`은 상태 계약과 순수 규칙만 가지며 React, DOM, 구체 config를 참조하지 않는다.
- `config`는 domain 계약에 맞는 실험체, 적, 카드, 라운드, 전장 수치를 제공한다.
- `simulation`은 `SimulationContext`의 `GameConfig`와 `RandomGenerator` 인터페이스만 사용한다.
- `application`은 command 단위 transaction과 reducer action routing을 담당한다.
- `app/GameProvider.tsx`가 기본 config, xorshift32 RNG, reducer, 고정 게임 루프를 조립한다.
- selector가 `RunState`와 config를 UI ViewModel로 바꾸며 UI는 config나 reducer를 직접 참조하지 않는다.

## 런타임 흐름

`GameProvider`는 `useReducer` 상태와 `requestAnimationFrame` 루프를 제공한다. 전투와 시간 제한 카드 선택 중 프레임 delta는 최대 0.1초로 제한하고 accumulator가 1/60초 이상일 때만 `TICK`을 전달한다. `step-combat.ts`는 명세의 고정 순서로 simulation system을 호출하며 세부 규칙은 각 system과 skill registry에 둔다. 라운드별 적 수와 보스 ID는 `RoundDefinition`으로 주입하며 application과 UI는 특정 보스 이름을 하드코딩하지 않는다.

게임플레이 상태는 `RunState`, notification queue는 `GameStoreState`, 선택·drag·카드 강조·overlay 표시는 `useGameUiState`에 분리한다. RNG seed와 엔티티 counter는 `RunState`에 저장하므로 같은 seed와 action/TICK 순서는 같은 결과를 만든다.

## 렌더링

배경은 `public/back.png`, 실험체는 공식 SD 원본에서 생성한 투명 512×512 WebP를 사용한다. 적은 정식 에셋 교체 전까지 `public/enemies/placeholder.svg`를 공유하며 정의별 크기와 색으로 구분한다. 배치판, 적, 투사체, 사거리 표시는 모두 1374×1145 SVG 좌표계를 `preserveAspectRatio="xMidYMid slice"`로 공유한다. 게임 화면은 최대 1920×1080으로 중앙 정렬하고, 1100px 이상 데스크톱에서는 좌우 패널을 220~282px 범위로 조정해 전장 비율을 유지한다.
