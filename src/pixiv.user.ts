// ==UserScript==
// @name           픽시브 뷰어
// @name:ko        픽시브 뷰어
// @name:en        pixiv viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        {date_version}
// @match          https://www.pixiv.net/**
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @license        MIT
// @connect        mittere.io
// @connect        *
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       link:vim_comic_viewer https://update.greasyfork.org/scripts/417893/1726982/vim%20comic%20viewer.js
// ==/UserScript==

import { main } from "./sites/pixiv.ts";

main();
