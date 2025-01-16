import React from "react";
import { render } from "@testing-library/react";
import RenderDate from "./RenderDate";
import { inputMeta, inputProps } from "./testHelper";

describe("RenderDate", () => {
    it("renders properly", () => {
        const { container } = render(<RenderDate
            id="dateInput"
            placeholder="yyyy-mm-dd"
            input={{ value: "", name: "dateInput", ...inputProps }}
            meta={inputMeta}
        />);
        expect(container).toMatchSnapshot();
    })
})