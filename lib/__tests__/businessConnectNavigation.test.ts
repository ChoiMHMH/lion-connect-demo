import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BUSINESS_CONNECT_ID,
  BUSINESS_CONNECT_HREF,
  BUSINESS_CONNECT_ROOT_SELECTOR,
  BUSINESS_CONNECT_SCROLL_OFFSET,
  BUSINESS_CONNECT_SCROLL_TIMEOUT_MS,
  getBusinessConnectScrollTop,
  scrollToBusinessConnectWhenReady,
} from "@/lib/businessConnectNavigation";

describe("businessConnectNavigation", () => {
  let observeMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;
  let mutationCallback: MutationCallback | undefined;
  let originalMutationObserver: typeof MutationObserver;

  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = "";
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    vi.spyOn(window.history, "replaceState").mockImplementation(() => {});

    observeMock = vi.fn();
    disconnectMock = vi.fn();
    mutationCallback = undefined;
    originalMutationObserver = window.MutationObserver;

    class MockMutationObserver {
      constructor(callback: MutationCallback) {
        mutationCallback = callback;
      }

      observe = observeMock;
      disconnect = disconnectMock;
      takeRecords = vi.fn();
    }

    window.MutationObserver = MockMutationObserver as unknown as typeof MutationObserver;
  });

  afterEach(() => {
    window.MutationObserver = originalMutationObserver;
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("uses the business connect hash href", () => {
    expect(BUSINESS_CONNECT_HREF).toBe("/#business-connect");
  });

  it("calculates scroll top with the 120px header offset", () => {
    const element = {
      getBoundingClientRect: () => ({ top: 520 }),
    } as Element;

    expect(getBusinessConnectScrollTop(element, 1000)).toBe(
      1000 + 520 - BUSINESS_CONNECT_SCROLL_OFFSET
    );
  });

  it("does not return a negative scroll top", () => {
    const element = {
      getBoundingClientRect: () => ({ top: 60 }),
    } as Element;

    expect(getBusinessConnectScrollTop(element, 0)).toBe(0);
  });

  it("scrolls immediately without creating an observer when the section exists", () => {
    document.body.innerHTML = `<section id="${BUSINESS_CONNECT_ID}"></section>`;

    const cleanup = scrollToBusinessConnectWhenReady({ behavior: "auto" });

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
    expect(window.history.replaceState).toHaveBeenCalledWith(null, "", BUSINESS_CONNECT_HREF);
    expect(observeMock).not.toHaveBeenCalled();

    cleanup();
    expect(disconnectMock).not.toHaveBeenCalled();
  });

  it("observes the business connect root and scrolls when the section is inserted", () => {
    document.body.innerHTML = `<div data-business-connect-root></div>`;
    const root = document.querySelector(BUSINESS_CONNECT_ROOT_SELECTOR);

    scrollToBusinessConnectWhenReady({ behavior: "auto" });

    expect(observeMock).toHaveBeenCalledWith(root, { childList: true, subtree: true });
    expect(window.scrollTo).not.toHaveBeenCalled();

    root?.insertAdjacentHTML("beforeend", `<section id="${BUSINESS_CONNECT_ID}"></section>`);
    mutationCallback?.([], {} as MutationObserver);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });

  it("disconnects the observer when the section is not inserted before timeout", () => {
    document.body.innerHTML = `<div data-business-connect-root></div>`;

    scrollToBusinessConnectWhenReady({ behavior: "auto" });
    vi.advanceTimersByTime(BUSINESS_CONNECT_SCROLL_TIMEOUT_MS);

    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to observing document.body when the business connect root is missing", () => {
    scrollToBusinessConnectWhenReady({ behavior: "auto" });

    expect(observeMock).toHaveBeenCalledWith(document.body, { childList: true, subtree: true });
  });
});
