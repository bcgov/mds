import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { PERMITS } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import TagManagement from "./TagManagement";

const initialState = {
    [PERMITS]: {
        permitConditionTags: MOCK.PERMIT_CONDITION_TAGS,
    }
};

describe("TagManagement", () => {
    it("renders properly", async () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <TagManagement />
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot()
    });
})