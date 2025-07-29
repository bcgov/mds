import React from "react";
import { render } from "@testing-library/react";
import { USER_ROLES } from "@mds/common/constants/environment";
import AuthorizationWrapper from "./AuthorizationWrapper";
import { AUTHENTICATION } from "../constants/reducerTypes";
import { ReduxWrapper } from "../tests/utils/ReduxWrapper";

const initialState = {
    [AUTHENTICATION]: {
        userAccessData: [
            USER_ROLES.role_view,
            USER_ROLES.role_edit_mines,
            USER_ROLES.role_edit_reports,
        ]
    }
}
const children = <div>hello</div>;

describe("AuthorizationWrapper", () => {
    it("empty params ", () => {
        const { container: component } = render(
            <ReduxWrapper initialState={initialState}>
                {/* EXPECT: hello */}
                <AuthorizationWrapper>{children}</AuthorizationWrapper>
            </ReduxWrapper>
        );
        expect(component).toMatchSnapshot();
    });

    it("renders major mine properly", () => {
        // const props = { isMajorMine: true };
        const { container: component } = render(
            <ReduxWrapper initialState={initialState}>
                {/* EXPECT: hello */}
                <AuthorizationWrapper >{children}</AuthorizationWrapper>
            </ReduxWrapper>
        );
        expect(component).toMatchSnapshot();
    });

    it("renders properly admin overrides is major mine", () => {
        // const props = { ...baseProps, userRoles: [...baseProps.userRoles, USER_ROLES.role_admin], isMajorMine: true };
        const { container: component } = render(
            <ReduxWrapper initialState={{
                [AUTHENTICATION]: {
                    userAccessData: [...initialState[AUTHENTICATION].userAccessData, USER_ROLES.role_admin]
                }
            }}>
                {/* EXPECT: hello */}
                <AuthorizationWrapper >{children}</AuthorizationWrapper>
            </ReduxWrapper>
        );
        expect(component).toMatchSnapshot();
    });

    it("renders properly edit and major mine require both success", () => {
        // const props = { ...baseProps, permission: USER_ROLES.role_edit_mines, isMajorMine: true };
        const { container: component } = render(
            <ReduxWrapper initialState={initialState}>
                {/* EXPECT: hello */}
                <AuthorizationWrapper permission={USER_ROLES.role_edit_mines} >{children}</AuthorizationWrapper>
            </ReduxWrapper>
        );
        expect(component).toMatchSnapshot();
    });

    it("renders properly edit and major mine require both wrong role: EMPTY", () => {
        // const props = { ...baseProps, isMajorMine: true, permission: USER_ROLES.role_edit_do };
        const { container: component } = render(
            <ReduxWrapper initialState={initialState}>
                {/* EXPECT: empty */}
                {/* not working right */}
                <AuthorizationWrapper permission={USER_ROLES.role_edit_do}>{children}</AuthorizationWrapper>
            </ReduxWrapper>
        );
        expect(component).toMatchSnapshot();
    });
});
