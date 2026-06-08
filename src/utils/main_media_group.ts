type MediaElement = HTMLImageElement | HTMLVideoElement;

export function findMainMediaGroup(root: ParentNode) {
  const media = collectMainMediaCandidates(root);
  if (media.length < 2) {
    return media;
  }

  const groups = getMediaGroups(media).sort((a, b) => b.score - a.score);
  return groups[0]?.media ?? [];
}

function collectMainMediaCandidates(root: ParentNode) {
  return [
    ...root.querySelectorAll('img[src]:not([src=""]), video[src]:not([src=""])'),
  ].filter(isMainMediaCandidate) as MediaElement[];
}

function getMediaGroups(media: MediaElement[]) {
  return getLayoutMediaGroups(media).map((groupMedia) => ({
    media: sortByDocumentOrder(groupMedia),
    score: scoreMediaGroup(groupMedia),
  }));
}

function getLayoutMediaGroups(media: MediaElement[]) {
  return groupByColumn(media).flatMap(splitByVerticalGap);
}

function groupByColumn(media: MediaElement[]) {
  const groups: MediaElement[][] = [];
  for (const mediaElement of sortByDocumentOrder(media)) {
    const center = getHorizontalCenter(mediaElement);
    const group = groups.find((x) => Math.abs(getAverageHorizontalCenter(x) - center) <= 160);
    if (group) {
      group.push(mediaElement);
    } else {
      groups.push([mediaElement]);
    }
  }

  return groups;
}

function splitByVerticalGap(media: MediaElement[]) {
  const groups: MediaElement[][] = [];
  for (const mediaElement of sortByVerticalPosition(media)) {
    const group = groups.at(-1);
    if (!group) {
      groups.push([mediaElement]);
      continue;
    }

    const previous = group.at(-1)!;
    const gap = mediaElement.getBoundingClientRect().top - previous.getBoundingClientRect().bottom;
    if (gap > 240) {
      groups.push([mediaElement]);
    } else {
      group.push(mediaElement);
    }
  }

  return groups;
}

function sortByDocumentOrder<T extends HTMLElement>(elements: T[]) {
  return [...elements].sort((a, b) => {
    const position = a.compareDocumentPosition(b);
    return position & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
  });
}

function sortByVerticalPosition<T extends HTMLElement>(elements: T[]) {
  return [...elements].sort((a, b) => {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    return aRect.top - bRect.top || aRect.left - bRect.left;
  });
}

function scoreMediaGroup(media: MediaElement[]) {
  const rects = media.map((x) => x.getBoundingClientRect());
  const mediaArea = rects.reduce((sum, rect) => sum + rect.width * rect.height, 0);
  const groupRect = getBoundingRect(rects);
  const containerArea = groupRect.width * groupRect.height;
  const wastedArea = Math.max(0, containerArea - mediaArea);

  return media.length * 100 +
    mediaArea / 1000 +
    scoreCenterColumn(rects) +
    scoreVerticalContinuity(sortRectsByPosition(rects)) -
    wastedArea / 4000 -
    scoreChromePenalty(media);
}

function getBoundingRect(rects: DOMRect[]) {
  const left = Math.min(...rects.map((x) => x.left));
  const top = Math.min(...rects.map((x) => x.top));
  const right = Math.max(...rects.map((x) => x.right));
  const bottom = Math.max(...rects.map((x) => x.bottom));
  return {
    height: bottom - top,
    width: right - left,
  };
}

function getHorizontalCenter(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return rect.left + rect.width / 2;
}

function getAverageHorizontalCenter(media: MediaElement[]) {
  return media.reduce((sum, mediaElement) => {
    return sum + getHorizontalCenter(mediaElement);
  }, 0) / media.length;
}

function scoreCenterColumn(rects: DOMRect[]) {
  const viewportCenter = innerWidth / 2;
  const averageDistance = rects.reduce((sum, rect) => {
    return sum + Math.abs(rect.left + rect.width / 2 - viewportCenter);
  }, 0) / rects.length;

  return Math.max(0, 50 - averageDistance / 8);
}

function scoreVerticalContinuity(rects: DOMRect[]) {
  return rects.slice(1).reduce((score, rect, index) => {
    const previous = rects[index];
    const gap = rect.top - previous.bottom;

    if (gap < 0) {
      return score + 8;
    }
    if (gap <= 120) {
      return score + 20;
    }
    return score - Math.min(40, gap / 20);
  }, 0);
}

function sortRectsByPosition(rects: DOMRect[]) {
  return [...rects].sort((a, b) => a.top - b.top || a.left - b.left);
}

function scoreChromePenalty(media: MediaElement[]) {
  return media.reduce((sum, mediaElement) => sum + getChromePenalty(mediaElement), 0);
}

function getChromePenalty(element: HTMLElement) {
  if (element.closest("header, nav, aside, footer")) {
    return 120;
  }

  let cursor: HTMLElement | null = element;
  while (cursor) {
    const text = getElementFingerprint(cursor);
    if (
      /\b(avatar|button|comment|emoji|icon|menu|profile|reaction|sticker|thumb)\b/i.test(text)
    ) {
      return 80;
    }
    cursor = cursor.parentElement;
  }

  return 0;
}

function getElementFingerprint(element: HTMLElement) {
  return [
    element.id,
    element.className,
    element.getAttribute("aria-label"),
    element.getAttribute("role"),
  ].filter((x) => typeof x === "string").join(" ");
}

function isMainMediaCandidate(element: Element): element is MediaElement {
  if (!(element instanceof HTMLImageElement || element instanceof HTMLVideoElement)) {
    return false;
  }
  if (!element.src || element.getClientRects().length === 0) {
    return false;
  }
  if (getChromePenalty(element) > 0) {
    return false;
  }

  const { width, height } = getMediaSize(element);
  const shortSide = Math.min(width, height);
  const longSide = Math.max(width, height);
  return shortSide >= 90 && longSide >= 160 && width * height >= 12_000;
}

function getMediaSize(element: MediaElement) {
  const rect = element.getBoundingClientRect();
  if (element instanceof HTMLImageElement) {
    return {
      width: rect.width || element.naturalWidth,
      height: rect.height || element.naturalHeight,
    };
  }

  return {
    width: rect.width || element.videoWidth,
    height: rect.height || element.videoHeight,
  };
}
