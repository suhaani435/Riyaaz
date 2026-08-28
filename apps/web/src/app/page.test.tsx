import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  it("renders RIYAAZ landing page successfully", () => {
    const page = HomePage();
    expect(page).toBeDefined();
    expect(page.type).toBe("div");
  });
});
