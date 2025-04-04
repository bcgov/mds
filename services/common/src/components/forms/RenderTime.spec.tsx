import React from "react";
import { render } from "@testing-library/react";
import moment from "moment";
import RenderTime from "./RenderTime";
import { inputMeta, inputProps } from "./testHelper";


const time = moment("2019-08-27T07:00:00.000Z");

describe("RenderTime", () => {
    it("renders properly", () => {
        const { container } = render(
            <RenderTime
                id="1"
                label="Time"
                input={{
                    value: time,
                    name: "time-field",
                    ...inputProps
                }}
                fullWidth
                meta={inputMeta}

            />);
        expect(container).toMatchSnapshot();
    });
});
