import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  it("declares RIYAAZ's practice focus", () => {
    const page = HomePage();
    const heading = page.props.children[1];

    expect(heading.props.children).toBe("Practice Kathak with intention.");
  });
});
