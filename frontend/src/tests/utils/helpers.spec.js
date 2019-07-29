import { compareCodes, codeSorter } from "@/utils/helpers";

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
  });

  describe("`codeSorter` function", () => {
    it("11 is after 9", () => {
      expect(codeSorter("11", "9")).toEqual(false);
    });

    it("11 is after 9", () => {
      expect(codeSorter("9", "11")).toEqual(true);
    });

    it("null is before a value", () => {
      expect(compareCodes(null, "1.11.8")).toEqual(true);
    });

    it("null is before a value", () => {
      expect(compareCodes("1.11.45 - lorem", null)).toEqual(true);
    });
  });
});
