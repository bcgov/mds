import { compareCodes, getLatestEvent } from "@common/utils/helpers";

describe("helpers class", () => {
  describe("`compareCodes` function", () => {
    it("11 is after 9", () => {
      expect(compareCodes("11", "9")).toEqual(1);
    });

    it("1.11 is after 1.8", () => {
      expect(compareCodes("1.8", "1.11")).toEqual(-1);
    });

    it("1.11.45 is after 1.11.8", () => {
      expect(compareCodes("1.11.45", "1.11.8")).toEqual(1);
    });

    it("1.11.45 - lorem is after 1.11.8 - ipsun", () => {
      expect(compareCodes("1.11.45 - lorem", "1.11.8 - ipsun")).toEqual(1);
    });

    it("1.2.3.(11) is after 1.2.3.(9)", () => {
      expect(compareCodes("1.2.3.(11) - lorem", "1.2.3.(9) - other")).toEqual(1);
    });

    it("null is before a value", () => {
      expect(compareCodes(null, "1.11.8")).toEqual(1);
    });

    it("null is before a value", () => {
      expect(compareCodes("1.11.45 - lorem", null)).toEqual(-1);
    });
  });

  describe("`getLatestEvent` function", () => {
    it("returns null for an empty array", () => {
      expect(getLatestEvent([])).toBeNull();
    });

    it("returns null when called with no arguments", () => {
      expect(getLatestEvent()).toBeNull();
    });

    it("returns the single event when there is only one", () => {
      const event = { start_date: "2021-01-01T00:00:00.000Z" };
      expect(getLatestEvent([event])).toEqual(event);
    });

    it("returns the event with the latest start_date", () => {
      const older = { start_date: "2021-01-01T00:00:00.000Z", id: 1 };
      const newer = { start_date: "2022-06-15T00:00:00.000Z", id: 2 };
      const middle = { start_date: "2021-09-01T00:00:00.000Z", id: 3 };
      expect(getLatestEvent([older, newer, middle])).toEqual(newer);
    });

    it("does not mutate the original array", () => {
      const events = [
        { start_date: "2022-01-01T00:00:00.000Z" },
        { start_date: "2021-01-01T00:00:00.000Z" },
      ];
      const original = [...events];
      getLatestEvent(events);
      expect(events).toEqual(original);
    });
  });
});
