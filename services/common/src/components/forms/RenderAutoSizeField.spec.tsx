import React from "react";
import { render } from "@testing-library/react";
import RenderAutoSizeField from "./RenderAutoSizeField";
import { inputMeta, inputProps } from "./testHelper";

describe("RenderAutoSizeField", () => {
    it("renders properly", () => {
        const { container } = render(<RenderAutoSizeField
            id="autoInput"
            maximumCharacters={50}
            input={{ value: "", name: "autoInput", ...inputProps }}
            meta={inputMeta}
        />);
        expect(container).toMatchSnapshot();
    })
})