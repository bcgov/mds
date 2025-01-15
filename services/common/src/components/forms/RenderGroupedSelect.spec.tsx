import React from "react";
import { render } from "@testing-library/react";
import RenderGroupedSelect from "./RenderGroupedSelect";
import { inputMeta, inputProps } from "./testHelper";

describe("RenderGroupedSelect", () => {
    it("renders properly", () => {
        const { container } = render(<RenderGroupedSelect
            id="groupedSelect"
            input={{ value: "", name: "groupedSelect", ...inputProps }}
            meta={inputMeta}
            data={[{
                groupName: "Group 1",
                opt: [{
                    label: "Opt a",
                    value: "a"
                }, {
                    label: "Opt b",
                    value: "b"
                }]
            }, {
                groupName: "Group 2",
                opt: [{
                    label: "Opt c",
                    value: "c"
                }, {
                    label: "Opt d",
                    value: "d"
                }]
            }]}
        />);
        expect(container).toMatchSnapshot();
    });
});
