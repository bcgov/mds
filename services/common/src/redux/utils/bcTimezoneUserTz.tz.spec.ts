import moment from "moment-timezone";
import { formatDateTimeUserTz } from "@mds/common/redux/utils/helpers";
import { dateNotBeforeStrictOther } from "@mds/common/redux/utils/Validate";
import { CANADA_TIMEZONE_MAP } from "@mds/common/constants/strings";
import {
    BC_MATRIX,
    Row,
    expectRows,
} from "@mds/common/tests/utils/bcTimezoneFixtures";

describe("BC timezone change: browser-zone based display (formatDateTimeUserTz)", () => {
    afterEach(() => jest.restoreAllMocks());

    it("shows BC time for a browser in America/Vancouver", () => {
        jest.spyOn(moment.tz, "guess").mockReturnValue("America/Vancouver");
        expectRows(
            BC_MATRIX.map(([scenario, instant, , text, abbreviation]): Row => [
                scenario,
                instant,
                `${text} (${abbreviation})`,
                formatDateTimeUserTz(instant) as string,
            ])
        );
    });
});

describe("BC timezone change: Canada zone picker mapping", () => {
    const displayZoneFor = (browserZone: string) =>
        Object.entries(CANADA_TIMEZONE_MAP).find(
            ([name, zones]) => zones.includes(browserZone) || name === browserZone
        )?.[0] ?? "none";

    it("still maps BC browsers to the display zones", () => {
        expectRows([
            ["America/Vancouver", "n/a", "Canada/Pacific", displayZoneFor("America/Vancouver")],
            ["America/Whitehorse", "n/a", "Canada/Yukon", displayZoneFor("America/Whitehorse")],
            ["America/Edmonton", "n/a", "Canada/Mountain", displayZoneFor("America/Edmonton")],
        ]);
    });

});

describe("BC timezone change: validation messages", () => {
    afterEach(() => moment.tz.setDefault());

    it("prints the earlier-than date in BC time", () => {
        moment.tz.setDefault("Canada/Pacific");
        const rows: Row[] = [
            ["Past winter", "2025-12-15T20:00:00Z", "Date cannot be before Incident - 2025-12-15 12:00 -08:00 PST"],
            ["New winter", "2026-12-15T20:00:00Z", "Date cannot be before Incident - 2026-12-15 13:00 -07:00 MST"],
        ].map(([scenario, other, expected]) => {
            const before = moment(other).subtract(1, "day").toISOString();
            const message = dateNotBeforeStrictOther(other, "Incident")(before) ?? "no error";
            return [scenario, other, expected, message];
        });
        expectRows(rows);
    });
});
