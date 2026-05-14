export const BUSINESS_CONNECT_ID = "business-connect";
export const BUSINESS_CONNECT_HASH = `#${BUSINESS_CONNECT_ID}`;
export const BUSINESS_CONNECT_HREF = `/${BUSINESS_CONNECT_HASH}`;
export const BUSINESS_CONNECT_SCROLL_OFFSET = 120;
export const BUSINESS_CONNECT_SCROLL_RETRY_DELAY_MS = 80;
export const BUSINESS_CONNECT_SCROLL_MAX_ATTEMPTS = 20;

type ScrollToBusinessConnectOptions = {
  behavior?: ScrollBehavior;
  updateHash?: boolean;
  onHashChange?: (hash: string) => void;
};

type ScrollWhenReadyOptions = ScrollToBusinessConnectOptions & {
  maxAttempts?: number;
  retryDelayMs?: number;
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
  maxAttempts = BUSINESS_CONNECT_SCROLL_MAX_ATTEMPTS,
  retryDelayMs = BUSINESS_CONNECT_SCROLL_RETRY_DELAY_MS,
  ...scrollOptions
}: ScrollWhenReadyOptions = {}) {
  let attempts = 0;

  const tryScroll = () => {
    if (scrollToBusinessConnect(scrollOptions)) return;

    attempts += 1;
    if (attempts < maxAttempts) {
      window.setTimeout(tryScroll, retryDelayMs);
    }
  };

  tryScroll();
}

export function clearBusinessConnectHash(onHashChange?: (hash: string) => void) {
  if (window.location.pathname === "/" && window.location.hash === BUSINESS_CONNECT_HASH) {
    window.history.replaceState(null, "", "/");
  }
  onHashChange?.("");
}
