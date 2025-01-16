import React from "react";
import { render } from "@testing-library/react";
import RenderMultiSelect from "./RenderMultiSelect";
import { inputMeta, inputProps } from "./testHelper";

describe("RenderMultiSelect", () => {
    it("renders properly", () => {
        const { container } = render(<RenderMultiSelect
            id="multiInput"
            data={[
                { label: "Opt 1", value: "opt1" },
                { label: "Opt 2", value: "opt2" },
                { label: "Opt 3", value: "opt3" }
            ]}
            input={{ value: ["opt1", "opt2"], name: "multiInput", ...inputProps }}
            meta={inputMeta}
        />);
        expect(container).toMatchSnapshot();
    })
})