import React from "react";
import { render } from "@testing-library/react";
import RenderDateTimeTz from "./RenderDateTimeTz";
import { inputMeta, inputProps } from "./testHelper";
import { normalizeDatetime } from "@mds/common/redux/utils/helpers";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { DEFAULT_TIMEZONE } from "@mds/common/constants";

const initialState = {
    form: {
        [inputMeta.form]: {
            values: { "tz_field_name": DEFAULT_TIMEZONE }
        }
    }
};
describe("RenderDateTimeTz", () => {
    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <RenderDateTimeTz
                    id="dateTzInput"
                    normalize={normalizeDatetime}
                    input={{ value: new Date("2025-01-16"), name: "dateTzInput", ...inputProps }}
                    meta={inputMeta}
                    timezoneFieldProps={{ name: "tz_field_name" }}
                /></ReduxWrapper>);
        expect(container).toMatchSnapshot();
    })
})