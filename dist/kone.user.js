// ==UserScript==
// @name           코네 뷰어
// @name:ko        코네 뷰어
// @name:en        kone viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        251206190049
// @match          https://kone.gg/s/*/*
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @license        MIT
// @connect        mittere.io
// @connect        *
// @grant          GM.addValueChangeListener
// @grant          GM.getResourceText
// @grant          GM.getValue
// @grant          GM.removeValueChangeListener
// @grant          GM.setValue
// @grant          GM.xmlHttpRequest
// @grant          unsafeWindow
// @require        https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource       link:@headlessui/react       https://cdn.jsdelivr.net/npm/@headlessui/react@2.2.1/dist/headlessui.prod.cjs
// @resource       link:@stitches/react         https://cdn.jsdelivr.net/npm/@stitches/react@1.3.1-1/dist/index.cjs
// @resource       link:clsx                    https://cdn.jsdelivr.net/npm/clsx@2.1.1/dist/clsx.js
// @resource       link:fflate                  https://cdn.jsdelivr.net/npm/fflate@0.8.2/lib/browser.cjs
// @resource       link:jotai                   https://cdn.jsdelivr.net/npm/jotai@2.10.0/index.js
// @resource       link:jotai-cache             https://cdn.jsdelivr.net/npm/jotai-cache@0.5.0/dist/cjs/atomWithCache.js
// @resource       link:jotai/react             https://cdn.jsdelivr.net/npm/jotai@2.10.0/react.js
// @resource       link:jotai/react/utils       https://cdn.jsdelivr.net/npm/jotai@2.10.0/react/utils.js
// @resource       link:jotai/utils             https://cdn.jsdelivr.net/npm/jotai@2.10.0/utils.js
// @resource       link:jotai/vanilla           https://cdn.jsdelivr.net/npm/jotai@2.10.0/vanilla.js
// @resource       link:jotai/vanilla/utils     https://cdn.jsdelivr.net/npm/jotai@2.10.0/vanilla/utils.js
// @resource       link:overlayscrollbars       https://cdn.jsdelivr.net/npm/overlayscrollbars@2.10.0/overlayscrollbars.cjs
// @resource       link:overlayscrollbars-react https://cdn.jsdelivr.net/npm/overlayscrollbars-react@0.5.6/overlayscrollbars-react.cjs.js
// @resource       link:react                   https://cdn.jsdelivr.net/npm/react@19.0.0/cjs/react.production.js
// @resource       link:react-dom               https://cdn.jsdelivr.net/npm/react-dom@19.0.0/cjs/react-dom.production.js
// @resource       link:react-dom/client        https://cdn.jsdelivr.net/npm/react-dom@19.0.0/cjs/react-dom-client.production.js
// @resource       link:react-toastify          https://cdn.jsdelivr.net/npm/react-toastify@10.0.5/dist/react-toastify.js
// @resource       link:react/jsx-runtime       https://cdn.jsdelivr.net/npm/react@19.0.0/cjs/react-jsx-runtime.production.js
// @resource       link:scheduler               https://cdn.jsdelivr.net/npm/scheduler@0.23.2/cjs/scheduler.production.min.js
// @resource       link:vcv-inject-node-env     data:,unsafeWindow.process=%7Benv:%7BNODE_ENV:%22production%22%7D%7D
// @resource       link:vim_comic_viewer        https://update.greasyfork.org/scripts/417893/1708669/vim%20comic%20viewer.js
// @resource       overlayscrollbars-css        https://cdn.jsdelivr.net/npm/overlayscrollbars@2.10.0/styles/overlayscrollbars.min.css
// @resource       react-toastify-css           https://cdn.jsdelivr.net/npm/react-toastify@10.0.5/dist/ReactToastify.css
// ==/UserScript==
"use strict";

define("main", (require, exports, module) => {
let vim_comic_viewer = require("vim_comic_viewer");
function main() {
	listenPageChange();
	addEventListener("keydown", (event) => {
		switch (event.key) {
			case "m":
				goToCommentIfEligible(event);
				break;
		}
	});
}
async function listenPageChange() {
	const originalPushState = history.pushState;
	history.pushState = function(...args) {
		originalPushState.apply(history, args);
		initializeViewer();
	};
	const originalReplaceState = history.replaceState;
	history.replaceState = function(...args) {
		originalReplaceState.apply(history, args);
		initializeViewer();
	};
	addEventListener("popstate", initializeViewer);
	const viewer = await (0, vim_comic_viewer.initialize)({
		source: comicSource,
		mediaProps: { loading: "lazy" }
	});
	async function initializeViewer() {
		const firstMedia = await searchMedia();
		for (let i = 0; i < 5; i++) {
			await vim_comic_viewer.utils.timeout(100);
			const latestMedia = await searchMedia();
			if (JSON.stringify(firstMedia) !== JSON.stringify(latestMedia)) break;
		}
		viewer.setOptions({
			source: comicSource,
			mediaProps: { loading: "lazy" }
		});
	}
}
function goToCommentIfEligible(event) {
	if (isCaptureTargetEvent(event)) document.querySelector("svg.lucide-message-circle")?.parentElement?.click();
}
function isCaptureTargetEvent(event) {
	const { ctrlKey, altKey, shiftKey } = event;
	return !(ctrlKey || altKey || shiftKey || vim_comic_viewer.utils.isTyping(event));
}
async function comicSource({ cause }) {
	const urls = (await searchMedia()).map((x) => x.src);
	return cause === "download" ? await getOriginalUrls(urls) : urls;
}
async function getOriginalUrls(urls) {
	const articleId = location.pathname.split("/").at(-1);
	if (!articleId) return urls;
	const originalUrl = `https://api.kone.gg/v0/article/${articleId}/media/original`;
	return (await (await fetch(originalUrl, {
		method: "POST",
		body: JSON.stringify({ media_url: urls }),
		headers: { "Content-Type": "application/json" }
	})).json()).media.map((x) => x.url);
}
async function searchMedia() {
	while (true) {
		const post = document.getElementById("post_content")?.shadowRoot;
		if (!post) {
			await vim_comic_viewer.utils.timeout(100);
			continue;
		}
		const media = [...post.querySelectorAll("img[src]:not([src=\"\"]), video[src]:not([src=\"\"])")];
		if (media.length === 0) {
			await vim_comic_viewer.utils.timeout(100);
			continue;
		}
		return media;
	}
}
main();


});

define("tampermonkey_grants", function() { Object.assign(this.window, { GM, unsafeWindow }); });
requirejs.config({ deps: ["tampermonkey_grants"] });
load()

async function load() {
  const links = GM.info.script.resources.filter(x => x.name.startsWith("link:"));
  await Promise.all(links.map(async ({ name }) => {
    const script = await GM.getResourceText(name)
    define(name.replace("link:", ""), Function("require", "exports", "module", script))
  }));
  require(["main"], () => {}, console.error);
}
