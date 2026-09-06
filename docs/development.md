# 개발 실행 기준

- 현재 검증 환경은 Node.js 26.4.0, npm 11.17.0이다.
- 의존성 설치: `npm ci`
- 일반 테스트: `npm test`
- 타입 검사 및 프로덕션 빌드: `npm run build`
- 64시드 밸런스 검증: `BALANCE_SEEDS=64 npm run test:balance`
- SD 에셋 생성: `uv run scripts/prepare_unit_assets.py --output-dir public/units`

`package-lock.json`은 npm 설치 결과를 고정하기 위해 저장소에서 추적한다. Vite 설정의 원본은 `vite.config.ts` 하나이며, TypeScript 설정은 emit하지 않는다.
