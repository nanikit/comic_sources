import { hookListPage } from "../hitomi/list.ts";
import { hookReaderPage } from "../hitomi/reader.ts";

export async function initialize() {
  const { pathname } = location;
  if (pathname.startsWith("/reader")) {
    await hookReaderPage();
  } else if (!/^\/(manga|doujinshi|cg)\//.test(pathname)) {
    await hookListPage();
  }
}
