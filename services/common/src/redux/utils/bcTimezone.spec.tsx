/**
 * BC permanent UTC-7 (no fall-back on 2026-11-01) readiness checks.
 * Failures print a Scenario / Expected / Actual / Result table.
 */
import React from "react";
import moment from "moment-timezone";
import { render } from "@testing-library/react";
import { formatDateTimeTz } from "@mds/common/redux/utils/helpers";
import { dateNotInFutureTZ } from "@mds/common/redux/utils/Validate";
import RenderDateTimeTz from "@mds/common/components/forms/RenderDateTimeTz";
import { inputMeta, inputProps } from "@mds/common/components/forms/testHelper";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { BC_MATRIX, Row, expectRows } from "@mds/common/tests/utils/bcTimezoneFixtures";

const ZONES = ["Canada/Pacific", "America/Vancouver"];

describe("BC timezone change: bundled tz data", () => {
    it.each(ZONES)("%s offsets before and after 2026-11-01", (zone) => {
        expectRows(
            BC_MATRIX.map(([scenario, instant, offset, , abbreviation]): Row => [
                `${zone}: ${scenario}`,
                instant,
                `${offset} ${abbreviation}`,
                moment.tz(instant, zone).format("Z z"),
            ])
        );
    });
});

describe("BC timezone change: displayed incident time (formatDateTimeTz)", () => {
    it.each(ZONES)("%s shows the right BC hour", (zone) => {
        expectRows(
            BC_MATRIX.map(([scenario, instant, , text, abbreviation]): Row => [
                `${zone}: ${scenario}`,
                instant,
                `${text} (${abbreviation})`,
                formatDateTimeTz(instant, zone),
            ])
        );
    });
});

describe("BC timezone change: time entered in the form", () => {
    it("converts BC local input to the correct UTC instant", () => {
        const cases: [string, string, string, string][] = [
            ["Past winter, 10:00 BC", "2025-12-15 10:00", "2025-12-15T18:00:00.000Z", "-08:00 PST"],
            ["Summer, 10:00 BC", "2026-07-01 10:00", "2026-07-01T17:00:00.000Z", "-07:00 PDT"],
            ["Old fall-back date, 10:00 BC", "2026-11-01 10:00", "2026-11-01T17:00:00.000Z", "-07:00 MST"],
            ["New winter, 10:00 BC", "2026-12-15 10:00", "2026-12-15T17:00:00.000Z", "-07:00 MST"],
        ];
        expectRows(
            cases.map(([scenario, local, utc]): Row => [
                scenario,
                local,
                utc,
                moment.tz(local, "Canada/Pacific").toISOString(),
            ])
        );
        expectRows(
            cases.map(([scenario, local, , expected]): Row => [
                `${scenario}: displayed zone`,
                local,
                expected,
                moment.tz(local, "Canada/Pacific").format("Z z"),
            ])
        );
    });
});

describe("BC timezone change: 'not in the future' validation", () => {
    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(new Date("2026-11-01T09:30:00Z"));
    });
    afterEach(() => {
        jest.useRealTimers();
        moment.tz.setDefault();
    });

    it("accepts a past time and rejects a future time around the old fall-back", () => {
        const message = "Date cannot be in the future";
        expectRows([
            ["1 minute earlier", "2026-11-01T09:29:00Z", "valid", dateNotInFutureTZ("2026-11-01T09:29:00Z") ?? "valid"],
            ["1 minute later", "2026-11-01T09:31:00Z", message, dateNotInFutureTZ("2026-11-01T09:31:00Z") ?? "valid"],
        ]);
    });
});

describe("Known RenderDateTimeTz global timezone behavior", () => {
    afterEach(() => moment.tz.setDefault());

    it("sets the app-wide default zone to the form timezone", () => {
        moment.tz.setDefault();
        render(
            <ReduxWrapper initialState={{ form: { [inputMeta.form]: { values: {} } } }}>
                <RenderDateTimeTz
                    id="dateTzInput"
                    timezone="Canada/Mountain"
                    input={{ value: "2026-12-15T20:00:00Z", name: "dateTzInput", ...inputProps }}
                    meta={inputMeta}
                />
            </ReduxWrapper>
        );
        expectRows([
            [
                "Default zone after rendering a Canada/Mountain field",
                "n/a",
                "Canada/Mountain",
                (moment() as moment.Moment & { tz(): string | undefined }).tz() ?? "unset",
            ],
        ]);
    });
});
