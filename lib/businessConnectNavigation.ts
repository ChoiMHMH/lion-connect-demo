export const BUSINESS_CONNECT_ID = "business-connect";
export const BUSINESS_CONNECT_HASH = `#${BUSINESS_CONNECT_ID}`;
export const BUSINESS_CONNECT_HREF = `/${BUSINESS_CONNECT_HASH}`;
export const BUSINESS_CONNECT_ROOT_ATTRIBUTE = "data-business-connect-root";
export const BUSINESS_CONNECT_ROOT_SELECTOR = `[${BUSINESS_CONNECT_ROOT_ATTRIBUTE}]`;
export const BUSINESS_CONNECT_SCROLL_OFFSET = 120;
export const BUSINESS_CONNECT_SCROLL_TIMEOUT_MS = 1600;

type ScrollToBusinessConnectOptions = {
  behavior?: ScrollBehavior;
  updateHash?: boolean;
  onHashChange?: (hash: string) => void;
};

type ScrollWhenReadyOptions = ScrollToBusinessConnectOptions & {
  timeoutMs?: number;
};

export function getBusinessConnectScrollTop(
  element: Element,
  scrollY = window.pageYOffset,
  offset = BUSINESS_CONNECT_SCROLL_OFFSET
) {
  return Math.max(0, element.getBoundingClientRect().top + scrollY - offset);
}

export function scrollToBusinessConnect({
  behavior = "smooth",
  updateHash = true,
  onHashChange,
}: ScrollToBusinessConnectOptions = {}) {
  const element = document.getElementById(BUSINESS_CONNECT_ID);
  if (!element) return false;

  window.scrollTo({
    top: getBusinessConnectScrollTop(element),
    behavior,
  });

  if (updateHash) {
    window.history.replaceState(null, "", BUSINESS_CONNECT_HREF);
    onHashChange?.(BUSINESS_CONNECT_HASH);
  }

  return true;
}

export function scrollToBusinessConnectWhenReady({
  timeoutMs = BUSINESS_CONNECT_SCROLL_TIMEOUT_MS,
  ...scrollOptions
}: ScrollWhenReadyOptions = {}) {
  if (scrollToBusinessConnect(scrollOptions)) return () => {};

  const root = document.querySelector(BUSINESS_CONNECT_ROOT_SELECTOR) ?? document.body;
  if (!root) return () => {};

  let isCleanedUp = false;

  const observer = new window.MutationObserver(() => {
    if (scrollToBusinessConnect(scrollOptions)) {
      cleanup();
    }
  });

  const cleanup = () => {
    if (isCleanedUp) return;

    isCleanedUp = true;
    observer.disconnect();
    window.clearTimeout(timeoutId);
  };

  const timeoutId = window.setTimeout(cleanup, timeoutMs);

  observer.observe(root, { childList: true, subtree: true });

  return cleanup;
}

export function clearBusinessConnectHash(onHashChange?: (hash: string) => void) {
  if (window.location.pathname === "/" && window.location.hash === BUSINESS_CONNECT_HASH) {
    window.history.replaceState(null, "", "/");
  }
  onHashChange?.("");
}
