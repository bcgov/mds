import React from "react";
import { render } from "@testing-library/react";
import RenderField from "./RenderField";
import { errorInputMeta, inputProps } from "./testHelper";

describe("RenderField", () => {
    it("renders properly with required, invalid state + label", () => {
        const { container } = render(<RenderField
            id="field"
            label="Mock Label"
            required
            input={{ value: "", name: "field", ...inputProps }}
            meta={errorInputMeta}
        />);
        expect(container).toMatchSnapshot();
    })
})