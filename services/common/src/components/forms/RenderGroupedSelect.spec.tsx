import React from "react";
import { render } from "@testing-library/react";
import RenderGroupedSelect from "./RenderGroupedSelect";
import { inputMeta, inputProps } from "./testHelper";

describe("RenderGroupedSelect", () => {
    it("renders properly", () => {
        const { container } = render(<RenderGroupedSelect
            id="parties"
            input={{ value: "", ...inputProps }}
            meta={inputMeta}
        />);
        expect(container).toMatchSnapshot();
    });
});
