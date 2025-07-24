import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import AdminPermitConditionManagement from "./AdminPermitConditionManagement";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { USER_ACCESS_DATA } from "@mds/common/tests/mocks/dataMocks";
import { USER_ROLES } from "@mds/common/constants/environment";

const initialState = {
    [AUTHENTICATION]: {
        userAccessData: [...USER_ACCESS_DATA, USER_ROLES.role_edit_template_conditions],
        isAuthenticated: true,
    }
}
function mockFunction() {
    const original = jest.requireActual("react-router-dom");
    return {
        ...original,
        useParams: jest.fn().mockReturnValue({
            type: "sand-and-gravel",
        }),
    };
};

jest.mock("react-router-dom", () => mockFunction());

describe("AdminPermitConditionManagement", () => {
    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <BrowserRouter>
                    <AdminPermitConditionManagement />
                </BrowserRouter>
            </ReduxWrapper>
        );

        expect(container).toMatchSnapshot();
    });
});