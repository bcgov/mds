import React from "react";
import { render } from "@testing-library/react";
import RenderDate from "./RenderDate";
import { inputMeta, inputProps } from "./testHelper";

describe("RenderDate", () => {
    it("renders properly", () => {
        const { container } = render(<RenderDate
            id="yearInput"
            yearMode
            input={{ value: new Date("2024-01-16"), name: "yearInput", ...inputProps }}
            meta={inputMeta}
        />);
        expect(container).toMatchSnapshot();
    })
})