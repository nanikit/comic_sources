// ==UserScript==
// @name           아카 뷰어
// @name:ko        아카 뷰어
// @name:en        arca viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        {date_version}
// @match          https://arca.live/b/*/*
// @match          https://*.arca.live/b/*/*
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @license        MIT
// @connect        namu.la
// @connect        *
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       link:vim_comic_viewer https://update.greasyfork.org/scripts/417893/1476400/vim%20comic%20viewer.js
// ==/UserScript==

import { main } from "./sites/arca.ts";

main();
