import React from "react";
import { render } from "@testing-library/react";
import RenderCheckbox from "./RenderCheckbox";
import { inputMeta, inputProps } from "./testHelper";

describe("RenderCheckbox", () => {
    it("renders properly", () => {
        const { container } = render(<RenderCheckbox
            id="check"
            label="Mock Label"
            input={{ value: "", name: "check", ...inputProps }}
            meta={inputMeta}
        />);
        expect(container).toMatchSnapshot();
    })
})