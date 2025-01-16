import React from "react";
import { render } from "@testing-library/react";
import RenderGroupCheckbox from "./RenderGroupCheckbox";
import { inputMeta, inputProps } from "./testHelper";

describe("RenderGroupCheckbox", () => {
    it("renders properly", () => {
        const { container } = render(<RenderGroupCheckbox
            id="groupInput"
            label="Mock Label"
            defaultValue={[]}
            options={[
                { label: "Opt 1", value: "opt1" },
                { label: "Opt 2", value: "opt2" },
                { label: "Opt 3", value: "opt3" }
            ]}
            input={{ value: ["opt1", "opt2"], name: "groupInput", ...inputProps }}
            meta={inputMeta}
        />);
        expect(container).toMatchSnapshot();
    })
})