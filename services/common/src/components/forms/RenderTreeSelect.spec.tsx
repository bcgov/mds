import React from "react";
import { render } from "@testing-library/react";
import RenderTreeSelect from "./RenderTreeSelect";
import FormWrapper from "./FormWrapper";
import { Field } from "./form";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const initialState = {
    form: {
        test_tree_select: {
            values: {
                tree_with_values: [1, 2, 3],
                tree_with_no_values: undefined
            }
        }
    }
}
const treeData = [{
    title: "title 0 - SNAP TEST IS BROKEN",
    value: 0,
    children: [{
        title: "title 1 - 👍",
        value: 1,
    }]
}, {
    title: "title 2 - 👍",
    value: 2,
    children: [{
        title: "title 3 - 👍",
        value: 3,
        children: [{
            title: "title 5 - SNAP TEST IS BROKEN",
            value: 5
        }]
    }, {
        title: "title 4 - SNAP TEST IS BROKEN",
        value: 4
    }]
}];

describe("RenderTreeSelect", () => {
    it("renders properly in edit mode", () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <FormWrapper name="test_tree_select" onSubmit={jest.fn()}>
                    <Field
                        name="tree_with_values"
                        label="Tree With Values"
                        required
                        treeData={treeData}
                        component={RenderTreeSelect}
                        multiple
                    />
                    <Field
                        name="tree_with_no_values"
                        label="Tree With No Values"
                        required
                        treeData={treeData}
                        component={RenderTreeSelect}
                        multiple
                    />
                </FormWrapper>
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot();
    });

    it("renders properly in view mode", () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <FormWrapper
                    name="test_tree_select"
                    onSubmit={jest.fn()}
                    isEditMode={false}
                >
                    <Field
                        name="tree_with_values"
                        label="Tree With Values"
                        required
                        treeData={treeData}
                        component={RenderTreeSelect}
                        multiple
                    />
                    <Field
                        name="tree_with_no_values"
                        label="Tree With No Values"
                        required
                        treeData={treeData}
                        component={RenderTreeSelect}
                        multiple
                    />
                </FormWrapper>
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot();
    });
})