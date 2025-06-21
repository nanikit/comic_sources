# 코네 뷰어

단축키 위주의 코네 이미지 뷰어입니다. PC 크롬, 파폭에서 쓸 수 있습니다.

## 설치법

1. Tampermonkey 브라우저 확장을 설치합니다.
   ([크롬, 웨일용](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en),
   [파폭용](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/))

2. [개발자 모드](https://www.tampermonkey.net/faq.php?locale=ko#Q209)를 켭니다.

3. [코네 뷰어 스크립트](https://greasyfork.org/scripts/428230-/code/kone_viewer.user.js)를
   설치합니다. (확장을 설치해야 설치 페이지가 열립니다)

4. 코네 페이지를 새로고침하고 주소 표시줄 오른쪽에 빨간 숫자가 뜨는지 확인합니다.

## 단축키

- <kbd>i</kbd>, <kbd>Enter</kbd>, <kbd>NumPad0</kbd>: 뷰어 열기/닫기
- <kbd>Shift</kbd> + (<kbd>i</kbd>, <kbd>Enter</kbd>, <kbd>NumPad0</kbd>): 전체 화면 설정을
  전환하면서 뷰어 열기/닫기
- <kbd>j</kbd>, <kbd>↓</kbd>, <kbd>q</kbd>, <kbd>PgDn</kbd>: 다음 페이지
- <kbd>k</kbd>, <kbd>↑</kbd>, <kbd>PgUp</kbd>: 이전 페이지
- <kbd>m</kbd>: 댓글란으로 이동
- <kbd>;</kbd>: 다운로드
- <kbd>'</kbd>: 이미지 새로고침
- <kbd>,</kbd>: 한쪽 페이지 수 줄이기
- <kbd>.</kbd>: 한쪽 페이지 수 늘리기
- <kbd>/</kbd>: 현재 페이지 전까지 한쪽 페이지로 설정

## FAQ

### 동작하지 않습니다

막 설치했다면 새로고침을 해보고 tampermonkey 아이콘에 숫자가 뜨는지 확인합시다. 그게 없으면 활성화가
안 된 것.

그래도 이상하다면 업데이트를 해봅시다. 이미 고친 버그일 수도 있으니까요.

### 업데이트는 어떻게 하죠?

보통 하루 단위로 자동 업데이트가 되고 저 링크를 다시 클릭해서 재설치할 수 있습니다.

최신 버전이 확실해도 이상하다면 좀 꺼두거나 버그 제보를 해봅시다.

### 버그 제보를 하고 싶어요

약간 가이드를 제공하자면 다음 정보가 들어가면 좋습니다.

1. 수행한 것 (안 되는 URL같은 정보를 포함해서 다른 사람도 재현 가능하도록)
2. 원했던 동작
3. 실제 동작
4. Ctrl + Shift + I or F12 키로 나오는 개발자 도구 창 Console 탭에서 보이는 빨간 에러 메시지들
