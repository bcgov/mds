import React from "react";
import { render } from "@testing-library/react";
import RenderSelect from "./RenderSelect";
import { inputMeta, inputProps } from "./testHelper";

describe("RenderSelect", () => {
    it("renders properly", () => {
        const { container } = render(<RenderSelect
            id="selectInput"
            input={{ value: "opt1", name: "selectInput", ...inputProps }}
            data={[
                { value: "opt1", label: "Opt 1" },
                { value: "opt2", label: "Opt 2" }
            ]}
            meta={inputMeta}
        />);
        expect(container).toMatchSnapshot();
    })
})