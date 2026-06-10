// ==UserScript==
// @name           아카 뷰어
// @name:en        arca viewer
// @name:ko        아카 뷰어
// @description    i,j,k 키를 눌러보세요
// @description:en press i to open
// @description:ko i,j,k 키를 눌러보세요
// @version        260610160820
// @author         nanikit
// @namespace      https://greasyfork.org/ko/users/713014-nanikit
// @match          https://*.arca.live/b/*/*
// @match          https://arca.live/b/*/*
// @license        MIT
// @connect        *
// @connect        namu.la
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
// @resource       link:vim_comic_viewer        https://update.greasyfork.org/scripts/417893/1762153/vim%20comic%20viewer.js
// @resource       overlayscrollbars-css        https://cdn.jsdelivr.net/npm/overlayscrollbars@2.10.0/styles/overlayscrollbars.min.css
// @resource       react-toastify-css           https://cdn.jsdelivr.net/npm/react-toastify@10.0.5/dist/ReactToastify.css
// ==/UserScript==
"use strict";

define("main", (require, exports, module) => {
let vim_comic_viewer = require("vim_comic_viewer");
function findMainMediaGroup(root) {
	const media = collectMainMediaCandidates(root);
	if (media.length < 2) return media;
	return getMediaGroups(media).sort((a, b) => b.score - a.score)[0]?.media ?? [];
}
function collectMainMediaCandidates(root) {
	return [...root.querySelectorAll("img[src]:not([src=\"\"]), video[src]:not([src=\"\"])")].filter(isMainMediaCandidate);
}
function getMediaGroups(media) {
	return getLayoutMediaGroups(media).map((groupMedia) => ({
		media: sortByDocumentOrder(groupMedia),
		score: scoreMediaGroup(groupMedia)
	}));
}
function getLayoutMediaGroups(media) {
	return groupByColumn(media).flatMap(splitByVerticalGap);
}
function groupByColumn(media) {
	const groups = [];
	for (const mediaElement of sortByDocumentOrder(media)) {
		const center = getHorizontalCenter(mediaElement);
		const group = groups.find((x) => Math.abs(getAverageHorizontalCenter(x) - center) <= 160);
		if (group) group.push(mediaElement);
		else groups.push([mediaElement]);
	}
	return groups;
}
function splitByVerticalGap(media) {
	const groups = [];
	for (const mediaElement of sortByVerticalPosition(media)) {
		const group = groups.at(-1);
		if (!group) {
			groups.push([mediaElement]);
			continue;
		}
		const previous = group.at(-1);
		if (mediaElement.getBoundingClientRect().top - previous.getBoundingClientRect().bottom > 240) groups.push([mediaElement]);
		else group.push(mediaElement);
	}
	return groups;
}
function sortByDocumentOrder(elements) {
	return [...elements].sort((a, b) => {
		return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
	});
}
function sortByVerticalPosition(elements) {
	return [...elements].sort((a, b) => {
		const aRect = a.getBoundingClientRect();
		const bRect = b.getBoundingClientRect();
		return aRect.top - bRect.top || aRect.left - bRect.left;
	});
}
function scoreMediaGroup(media) {
	const rects = media.map((x) => x.getBoundingClientRect());
	const mediaArea = rects.reduce((sum, rect) => sum + rect.width * rect.height, 0);
	const groupRect = getBoundingRect(rects);
	const containerArea = groupRect.width * groupRect.height;
	const wastedArea = Math.max(0, containerArea - mediaArea);
	return media.length * 100 + mediaArea / 1e3 + scoreCenterColumn(rects) + scoreVerticalContinuity(sortRectsByPosition(rects)) - wastedArea / 4e3 - scoreChromePenalty(media);
}
function getBoundingRect(rects) {
	const left = Math.min(...rects.map((x) => x.left));
	const top = Math.min(...rects.map((x) => x.top));
	const right = Math.max(...rects.map((x) => x.right));
	return {
		height: Math.max(...rects.map((x) => x.bottom)) - top,
		width: right - left
	};
}
function getHorizontalCenter(element) {
	const rect = element.getBoundingClientRect();
	return rect.left + rect.width / 2;
}
function getAverageHorizontalCenter(media) {
	return media.reduce((sum, mediaElement) => {
		return sum + getHorizontalCenter(mediaElement);
	}, 0) / media.length;
}
function scoreCenterColumn(rects) {
	const viewportCenter = innerWidth / 2;
	const averageDistance = rects.reduce((sum, rect) => {
		return sum + Math.abs(rect.left + rect.width / 2 - viewportCenter);
	}, 0) / rects.length;
	return Math.max(0, 50 - averageDistance / 8);
}
function scoreVerticalContinuity(rects) {
	return rects.slice(1).reduce((score, rect, index) => {
		const previous = rects[index];
		const gap = rect.top - previous.bottom;
		if (gap < 0) return score + 8;
		if (gap <= 120) return score + 20;
		return score - Math.min(40, gap / 20);
	}, 0);
}
function sortRectsByPosition(rects) {
	return [...rects].sort((a, b) => a.top - b.top || a.left - b.left);
}
function scoreChromePenalty(media) {
	return media.reduce((sum, mediaElement) => sum + getChromePenalty(mediaElement), 0);
}
function getChromePenalty(element) {
	if (element.closest("header, nav, aside, footer")) return 120;
	let cursor = element;
	while (cursor) {
		const text = getElementFingerprint(cursor);
		if (/\b(avatar|button|comment|emoji|icon|menu|profile|reaction|sticker|thumb)\b/i.test(text)) return 80;
		cursor = cursor.parentElement;
	}
	return 0;
}
function getElementFingerprint(element) {
	return [
		element.id,
		element.className,
		element.getAttribute("aria-label"),
		element.getAttribute("role")
	].filter((x) => typeof x === "string").join(" ");
}
function isMainMediaCandidate(element) {
	if (!(element instanceof HTMLImageElement || element instanceof HTMLVideoElement)) return false;
	if (!element.src || element.getClientRects().length === 0) return false;
	if (getChromePenalty(element) > 0) return false;
	const { width, height } = getMediaSize(element);
	return Math.min(width, height) >= 90 && Math.max(width, height) >= 160 && width * height >= 12e3;
}
function getMediaSize(element) {
	const rect = element.getBoundingClientRect();
	if (element instanceof HTMLImageElement) return {
		width: rect.width || element.naturalWidth,
		height: rect.height || element.naturalHeight
	};
	return {
		width: rect.width || element.videoWidth,
		height: rect.height || element.videoHeight
	};
}
async function main() {
	const viewer = await (0, vim_comic_viewer.initialize)({ source: comicSource });
	addEventListener("keydown", (event) => {
		switch (event.key) {
			case "m":
				goToCommentIfEligible(event);
				break;
			default:
				forwardEvent(event, viewer);
				break;
		}
	}, { capture: true });
}
function forwardEvent(event, viewer) {
	if (viewer.defaultGlobalKeyHandler(event)) {
		event.stopPropagation();
		return;
	}
	if (getAncestors(event.target).includes(viewer.container)) {
		if (viewer.defaultElementKeyHandler(event)) event.stopPropagation();
	}
}
function goToCommentIfEligible(event) {
	if (isCaptureTargetEvent(event)) document.querySelector("#comment > *").scrollIntoView({ block: "center" });
}
function getAncestors(element) {
	const ancestors = [];
	let cursor = element;
	while (cursor) {
		ancestors.push(cursor);
		cursor = cursor.parentElement;
	}
	return ancestors;
}
function isCaptureTargetEvent(event) {
	const { ctrlKey, altKey, shiftKey } = event;
	return !(ctrlKey || altKey || shiftKey || vim_comic_viewer.utils.isTyping(event));
}
async function comicSource() {
	return (await searchMedia()).map((imgOrVideo) => (params) => getAdaptiveLink(imgOrVideo, params));
	function getAdaptiveLink(imgOrVideo, { cause }) {
		if (imgOrVideo.tagName === "VIDEO" || cause === "download") return imgOrVideo;
		const img = imgOrVideo;
		const linkUrl = img.parentElement?.href;
		const isGif = new URL(linkUrl).pathname.endsWith(".gif");
		const originalImageUrl = !!linkUrl && linkUrl.includes("type=orig") ? linkUrl : null;
		if (isGif || !originalImageUrl) return img;
		const adaptive = new Image();
		const width = Number(img.getAttribute("width") ?? img.width);
		const height = Number(img.getAttribute("height") ?? img.height);
		const safeWidth = Math.round(width / devicePixelRatio);
		adaptive.sizes = `(max-width: ${width * 2 - 1}px) ${safeWidth}px,
(max-height: ${height * 2 - 1}px) ${safeWidth}px,
${safeWidth * 2}px`;
		adaptive.srcset = `${img.src} ${Math.round(width)}w,
${linkUrl} ${Math.round(width * 2)}w`;
		adaptive.src = img.src;
		if (linkUrl) adaptive.loading = "lazy";
		return adaptive;
	}
}
async function searchMedia() {
	while (true) {
		const articleContent = document.querySelector(".article-content");
		if (!articleContent) {
			await vim_comic_viewer.utils.timeout(100);
			continue;
		}
		const media = findMainMediaGroup(articleContent);
		if (media.some((x) => x.tagName === "IMG" && !x.parentElement?.href)) {
			await vim_comic_viewer.utils.timeout(100);
			continue;
		}
		return media;
	}
}
main();


});

load()

async function load() {
  const links = GM.info.script.resources.filter(x => x.name.startsWith("link:"));
  await Promise.all(links.map(async ({ name }) => {
    const script = await GM.getResourceText(name)
    const createModule = Function("GM", "unsafeWindow", "return function(require, exports, module) {\n" + script + "\n}")
    define(name.replace("link:", ""), createModule(GM, unsafeWindow))
  }));
  require(["main"], () => {}, console.error);
}
