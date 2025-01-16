import React from "react";
import { render } from "@testing-library/react";
import RenderRadioButtons from "./RenderRadioButtons";
import { inputMeta, inputProps } from "./testHelper";

describe("RenderRadioButtons", () => {
    it("renders properly", () => {
        const { container } = render(<RenderRadioButtons
            id="radioInput"
            label="Mock Label"
            customOptions={[
                { label: "Opt 1", value: "opt1" },
                { label: "Opt 2", value: "opt2" }
            ]}
            input={{ value: "opt1", name: "radioInput", ...inputProps }}
            meta={inputMeta}
        />);
        expect(container).toMatchSnapshot();
    })
})