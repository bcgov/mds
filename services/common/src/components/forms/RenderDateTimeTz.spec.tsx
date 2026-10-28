import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RenderDateTimeTz from "./RenderDateTimeTz";
import { inputMeta, inputProps } from "./testHelper";
import { normalizeDatetime } from "@mds/common/redux/utils/helpers";
import { getStore } from "@mds/common/redux/rootState";
import { getFormValues } from "@mds/common/components/forms/form";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { Provider } from "react-redux";
import { DEFAULT_TIMEZONE } from "@mds/common/constants/strings";

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

    it("updates the form timezone when a timezone is selected", async () => {
        const store = getStore(initialState);
        render(
            <Provider store={store}>
                <RenderDateTimeTz
                    id="dateTzInput"
                    input={{ value: new Date("2025-01-16"), name: "dateTzInput", ...inputProps }}
                    meta={inputMeta}
                    timezoneFieldProps={{ name: "tz_field_name" }}
                />
            </Provider>
        );

        fireEvent.mouseDown(screen.getByRole("textbox"));
        fireEvent.mouseDown(await screen.findByRole("combobox"));
        fireEvent.click(await screen.findByText("Canada/Mountain"));

        await waitFor(() => {
            expect(getFormValues(inputMeta.form)(store.getState()).tz_field_name).toBe("Canada/Mountain");
        });
    });
})