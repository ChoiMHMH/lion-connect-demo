import { describe, expect, it } from "vitest";
import {
  BUSINESS_CONNECT_HREF,
  BUSINESS_CONNECT_SCROLL_OFFSET,
  getBusinessConnectScrollTop,
} from "@/lib/businessConnectNavigation";

describe("businessConnectNavigation", () => {
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
});
