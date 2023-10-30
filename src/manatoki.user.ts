// ==UserScript==
// @name           토끼 뷰어
// @name:ko        토끼 뷰어
// @name:en        toki viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        {date_version}
// @match          https://*.net/bbs/*
// @match          https://*.net/comic/*
// @match          https://*.com/webtoon/*
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @connect        *
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       link:vim_comic_viewer https://greasyfork.org/scripts/417893-vim-comic-viewer/code/vim%20comic%20viewer.js?version=1272873
// ==/UserScript==

import { main } from "./sites/manatoki.ts";

main();
