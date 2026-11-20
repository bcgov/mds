import moment from "moment";
import { formatUtcDate, formatUtcDateTime } from "@mds/common/redux/utils/helpers";

// API timestamps like create_timestamp are UTC but have no timezone, so they must not be read as local time.
describe("formatUtcDateTime / formatUtcDate", () => {
  const instant = "2026-10-22T21:22:00Z";

  it.each(["2026-10-22 21:22", "2026-10-22T21:22:00", instant])(
    "reads %s as UTC and shows it in local time",
    (value) => {
      expect(formatUtcDateTime(value)).toBe(moment(instant).format("lll"));
      expect(formatUtcDate(value)).toBe(moment(instant).format("MMM DD YYYY"));
    }
  );

  it("returns empty values unchanged", () => {
    expect(formatUtcDateTime(undefined)).toBeUndefined();
    expect(formatUtcDate(null)).toBeNull();
    expect(formatUtcDate("")).toBe("");
  });
});
