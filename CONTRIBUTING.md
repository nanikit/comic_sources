역량이 되신다면 기여하실 때 아래를 따라주세요.

- deno를 설치하고 vscode에서 권장 익스텐션(Deno)을 설치한 후 작업해주세요.
  포매팅, 린트 룰의 보조를 받기 위함입니다.
- Ctrl+Shift+B를 누르면 결과 파일을 생성할 수 있습니다. 테스트하려면 이 파일로
  테스트해주세요.
- 다만 위 결과 파일은 PR에 포함시키지 말아주세요. PR 머지가 릴리즈가 되어버리게
  됩니다.

만약의 경우, 이 프로젝트를 본격적으로 개발하려는 분이 있다면 제가 쓰는 개발
과정은 아래와 같습니다.

- 빈 폴더를 만들어서
  `deno run -A https://raw.githubusercontent.com/nanikit/deno_tamperdav/main/mod.ts --path=dav --meta-touch`를
  실행합니다. 이하 tamperdav라고 부릅니다.
- [이 링크](https://github.com/Tampermonkey/tamperdav?tab=readme-ov-file#clients)의
  방법으로 tampermonkey에 동기화를 설정합니다.
  ![](https://user-images.githubusercontent.com/767504/42598819-a1fb04a0-855d-11e8-8b42-a86abf577d82.png)
- 이 프로젝트를 클론합니다.
- 이 프로젝트 루트에 .env 파일을 만들고
  `OUTPUT_SYNC=<위의 빈 폴더>\dav\Tampermonkey\sync`를 채웁니다.
- Ctrl+Shift+B로 빌드합니다.
- tamperdav를 켠 상태로 크롬을 완전히 종료하고 켜면 스크립트 동기화 상태가
  유지됩니다.
