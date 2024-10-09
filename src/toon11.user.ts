// ==UserScript==
// @name           일일툰 뷰어
// @description    i,j,k 키를 눌러보세요
// @name:en        11toon viewer
// @description:en press i to open
// @version        {date_version}
// @include        /^https?:\/\/(www\.)?11toon\d+\.com\/bbs\/board\.php\?bo_table=toons&wr_id=\d+/
// @include        /^https?:\/\/(www\.)?spotv\d+\.com\/bbs\/board\.php\?bo_table=toons&wr_id=\d+/
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @license        MIT
// @connect        *
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       link:vim_comic_viewer https://update.greasyfork.org/scripts/417893/1461667/vim%20comic%20viewer.js
// ==/UserScript==
import { main } from "./sites/toon11.ts";

main();
