import { describe, expect, it } from "vitest";
import { getLatestCursor, getPositionFromCursor } from "./cursor";

describe("getLatestCursor", () => {
  it("should return the correct cursor", () => {
    for (const { total, pageSize, page, offset } of [
      { total: 8, pageSize: 3, page: 3, offset: 1 },
      { total: 7, pageSize: 3, page: 3, offset: 2 },
      { total: 7, pageSize: 2, page: 4, offset: 1 },
      { total: 26, pageSize: 20, page: 2, offset: 14 },
      { total: 30, pageSize: 100, page: 1, offset: 0 },
    ]) {
      expect(getLatestCursor({ total, pageSize })).toEqual({
        page,
        offset,
      });
    }
  });
});

describe("getPositionFromCursor", () => {
  it("should return the correct position", () => {
    for (const { page, offset, pageSize, start, end } of [
      { page: 1, offset: 0, pageSize: 3, start: 0, end: 2 },
      { page: 1, offset: 1, pageSize: 3, start: 0, end: 1 },
      { page: 1, offset: 2, pageSize: 3, start: 0, end: 0 },
      { page: 2, offset: 0, pageSize: 3, start: 3, end: 5 },
      { page: 2, offset: 1, pageSize: 3, start: 2, end: 4 },
      { page: 2, offset: 2, pageSize: 3, start: 1, end: 3 },
      { page: 2, offset: 14, pageSize: 20, start: 6, end: 25 },
      { page: 3, offset: 1, pageSize: 3, start: 5, end: 7 },
    ]) {
      expect(getPositionFromCursor({ page, offset }, { pageSize })).toEqual({
        start,
        end,
      });
    }
  });
});
