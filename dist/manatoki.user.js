// ==UserScript==
// @name           토끼 뷰어
// @name:ko        토끼 뷰어
// @name:en        toki viewer
// @description    i,j,k 키를 눌러보세요
// @description:ko i,j,k 키를 눌러보세요
// @description:en press i to open
// @version        250406112833
// @match          https://*.net/bbs/*
// @match          https://*.net/comic/*
// @match          https://*.com/webtoon/*
// @match          https://*.com/novel/*
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @license        MIT
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
// @resource       link:vim_comic_viewer        https://update.greasyfork.org/scripts/417893/1566357/vim%20comic%20viewer.js
// @resource       overlayscrollbars-css        https://cdn.jsdelivr.net/npm/overlayscrollbars@2.10.0/styles/overlayscrollbars.min.css
// @resource       react-toastify-css           https://cdn.jsdelivr.net/npm/react-toastify@10.0.5/dist/ReactToastify.css
// ==/UserScript==
"use strict";

define("main", (require, exports, module) => {
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
const vim_comic_viewer = __toESM(require("vim_comic_viewer"));
async function main() {
	const origin = getOrigin();
	if (origin === "unknown") return;
	markVisitedLinks();
	registerEpisodeNavigator();
	const buttons = duplicateViewerButton();
	const source = await comicSource();
	const controller = await (0, vim_comic_viewer.initialize)({
		source: () => source,
		onPreviousSeries: goPreviousEpisode,
		onNextSeries: goNextEpisode
	});
	controller.setScriptPreferences({
		manualPreset: origin,
		preferences: { pageDirection: origin === "manatoki" ? "rightToLeft" : "leftToRight" }
	});
	for (const button of buttons) button.addEventListener("click", async () => {
		await controller.setImmersive(true);
	});
}
function getOrigin() {
	const allowedOrigins = [
		"manatoki",
		"newtoki",
		"booktoki"
	];
	return allowedOrigins.find(originIncludes) ?? "unknown";
}
function originIncludes(str) {
	return location.origin.includes(str);
}
function duplicateViewerButton() {
	const template = document.createElement("template");
	template.innerHTML = `<a class="show_viewer" alt="뷰어로 보기">
    <i class="ion-ios-book at-tip" aria-hidden="true" style="color: blue;"></i>
  </a>`;
	const templateButton = template.content.firstElementChild;
	const buttons = [];
	const divs = document.querySelectorAll(".toon-nav");
	for (const div of divs) {
		const button = templateButton.cloneNode(true);
		div.prepend(button);
		buttons.push(button);
	}
	return buttons;
}
async function comicSource() {
	while (true) {
		const urls = getUrls();
		if (urls.length) return urls;
		await vim_comic_viewer.utils.timeout(200);
	}
}
function goPreviousEpisode() {
	document.getElementById("goPrevBtn")?.click?.();
}
function goNextEpisode() {
	document.getElementById("goNextBtn")?.click?.();
}
function registerEpisodeNavigator() {
	addEventListener("keydown", (event) => {
		const { ctrlKey, shiftKey, altKey } = event;
		if (ctrlKey || shiftKey || altKey || vim_comic_viewer.utils.isTyping(event)) return;
		switch (event.key) {
			case "t":
				document.getElementById("sticky-wrapper")?.scrollIntoView({ block: "center" });
				break;
			case "m":
				document.querySelector(".view-good")?.scrollIntoView({ block: "center" });
				break;
		}
	});
}
function getUrls() {
	const imgs = document.querySelectorAll("div.view-padding img");
	return [...imgs].flatMap(getUrl);
}
function getUrl(image) {
	if (image.offsetParent === null) return [];
	const data = Object.values(image.dataset);
	return data.length ? data : [image.src];
}
async function markVisitedLinks() {
	const links = document.querySelectorAll(".post-row a");
	const visitedLinks = new Set(await GM.getValue("visitedPaths", []));
	for (const link of links) {
		const url = link.getAttribute("href");
		if (!url) return;
		const path = new URL(url).pathname;
		if (visitedLinks.has(path)) link.style.color = "#e2e2e2";
		link.addEventListener("click", async () => {
			visitedLinks.add(path);
			await GM.setValue("visitedPaths", [...visitedLinks]);
		});
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
