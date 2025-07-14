import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { AUTHENTICATION, PERMITS } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import TagManagement from "./TagManagement";
import { USER_ROLES } from "@mds/common/constants/environment";
import { SystemFlagEnum } from "@mds/common/constants/enums";


function mockFunction() {
    const original = jest.requireActual("react-router-dom");
    return {
        ...original,
        useParams: jest.fn().mockReturnValue({
            tab: "tag-management"
        }),
    };
};

jest.mock("react-router-dom", () => mockFunction());


const initialState = {
    [PERMITS]: {
        permitConditionTags: MOCK.PERMIT_CONDITION_TAGS,
    },
    [AUTHENTICATION]: {
        systemFlag: SystemFlagEnum.core,
        userAccessData: [USER_ROLES.role_edit_template_conditions],
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