import React from "react";
import { render } from "@testing-library/react";
import RenderLargeSelect from "./RenderLargeSelect";
import { errorInputMeta, inputProps } from "./testHelper";

describe("RenderLargeSelect", () => {
    it("renders properly without required (optional), failed validation + label", () => {
        const { container } = render(<RenderLargeSelect
            id="field"
            label="Mock Label"
            required
            input={{ value: "", name: "field", ...inputProps }}
            meta={errorInputMeta}
            dataSource={[
                { label: "Opt 1", value: "opt1" },
                { label: "Opt 2", value: "opt2" },
                { label: "Opt 3", value: "opt3" }
            ]}
            selectedOption={{ label: "Opt 4", value: "opt4" }}
        />);
        expect(container).toMatchSnapshot();
    })
})