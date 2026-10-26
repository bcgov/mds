import React from "react";
import { render } from "@testing-library/react";
import moment from "moment-timezone";
import RenderDateTimeTz from "@mds/common/components/forms/RenderDateTimeTz";
import { FormContext } from "@mds/common/components/forms/FormWrapper";
import { inputMeta, inputProps } from "@mds/common/components/forms/testHelper";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { BC_MATRIX, Row, expectRows } from "@mds/common/tests/utils/bcTimezoneFixtures";

const viewText = (value: string, timezone: string) => {
    const { container, unmount } = render(
        <ReduxWrapper initialState={{ form: { [inputMeta.form]: { values: {} } } }}>
            <FormContext.Provider value={{ isEditMode: false } as any}>
                <RenderDateTimeTz
                    id="dateTzInput"
                    timezone={timezone}
                    input={{ value, name: "dateTzInput", ...inputProps }}
                    meta={inputMeta}
                />
            </FormContext.Provider>
        </ReduxWrapper>
    );
    const text = container.textContent ?? "";
    unmount();
    return text;
};

const editInputText = (value: string, timezone: string) => {
    const { container, unmount } = render(
        <ReduxWrapper
            initialState={{ form: { [inputMeta.form]: { values: { incident_timezone: timezone } } } }}
        >
            <FormContext.Provider value={{ isEditMode: true } as any}>
                <RenderDateTimeTz
                    id="dateTzInput"
                    timezoneFieldProps={{ name: "incident_timezone" }}
                    input={{ value, name: "dateTzInput", ...inputProps }}
                    meta={inputMeta}
                />
            </FormContext.Provider>
        </ReduxWrapper>
    );
    const text = (container.querySelector("input") as HTMLInputElement | null)?.value ?? "";
    unmount();
    return text;
};

describe("BC timezone change: RenderDateTimeTz view mode", () => {
    afterEach(() => moment.tz.setDefault());

    it.each(["Canada/Pacific", "America/Vancouver"])("%s shows the right BC time", (zone) => {
        expectRows(
            BC_MATRIX.map(([scenario, instant, offset, , abbreviation]): Row => {
                const expected = `${moment.utc(instant).utcOffset(offset).format("YYYY-MM-DD HH:mm")} ${offset} ${abbreviation}`;
                const actual = viewText(instant, zone).match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2} [+-]\d{2}:\d{2} [A-Z]{3,4}/)?.[0] ?? "no match";
                return [`${zone}: ${scenario}`, instant, expected, actual];
            })
        );
    });

    it.each(["Canada/Pacific", "America/Vancouver"])("%s edit field shows offset and abbreviation", (zone) => {
        expectRows(
            BC_MATRIX.map(([scenario, instant, offset, , abbreviation]): Row => [
                `${zone}: ${scenario}`,
                instant,
                `${moment.utc(instant).utcOffset(offset).format("YYYY-MM-DD HH:mm")} ${offset} ${abbreviation}`,
                editInputText(instant, zone),
            ])
        );
    });
});
