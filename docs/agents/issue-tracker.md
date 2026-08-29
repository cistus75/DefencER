# Issue tracker: Local Markdown

이 저장소의 이슈와 스펙은 `.scratch/` 아래의 마크다운 파일로 관리한다. 현재 Git 저장소와 원격 이슈 트래커는 사용하지 않는다.

## 규칙

- 기능 하나당 디렉터리 하나: `.scratch/<feature-slug>/`
- 기능 스펙: `.scratch/<feature-slug>/spec.md`
- 구현 이슈: `.scratch/<feature-slug>/issues/<NN>-<slug>.md`
- 이슈는 `01`부터 순서대로 번호를 붙이고 하나의 통합 티켓 파일로 합치지 않는다.
- 상태가 필요하면 파일 상단에 `Status:` 줄을 둔다.
- 논의 이력은 파일 하단의 `## Comments` 아래에 추가한다.

## 게시와 조회

- 이슈 트래커에 게시하라는 요청은 `.scratch/<feature-slug>/` 아래에 새 파일을 만드는 의미다.
- 관련 티켓을 조회하라는 요청은 사용자가 지정한 `.scratch/` 경로의 파일을 읽는 의미다.

