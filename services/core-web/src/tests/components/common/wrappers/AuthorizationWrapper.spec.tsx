import React from "react";
import { render } from "@testing-library/react";
import { USER_ROLES } from "@mds/common/constants/environment";
import { AuthorizationWrapper } from "@/components/common/wrappers/AuthorizationWrapper";
import * as PERMISSIONS from "@/constants/permissions";

const baseProps = {
  userRoles: [
    USER_ROLES[PERMISSIONS.VIEW_ALL],
    USER_ROLES[PERMISSIONS.EDIT_MINES],
    USER_ROLES[PERMISSIONS.EDIT_REPORTS],
  ],
};
const children = <div>hello</div>;

describe("AuthorizationWrapper", () => {
  it("empty params ", () => {
    const { container: component } = render(
      <AuthorizationWrapper {...baseProps}>{children}</AuthorizationWrapper>
    );
    expect(component).toMatchSnapshot();
  });

  it("renders major mine properly", () => {
    const props = { ...baseProps, isMajorMine: true };
    const { container: component } = render(
      <AuthorizationWrapper {...props}>{children}</AuthorizationWrapper>
    );
    expect(component).toMatchSnapshot();
  });

  it("renders properly admin overrides is major mine", () => {
    const props = { ...baseProps, userRoles: [...baseProps.userRoles, USER_ROLES[PERMISSIONS.ADMIN]], isMajorMine: true };
    const { container: component } = render(
      <AuthorizationWrapper {...props}>{children}</AuthorizationWrapper>
    );
    expect(component).toMatchSnapshot();
  });

  it("renders properly edit and major mine require both success", () => {
    const props = { ...baseProps, permission: PERMISSIONS.EDIT_MINES, isMajorMine: true };
    const { container: component } = render(
      <AuthorizationWrapper {...props}>{children}</AuthorizationWrapper>
    );
    expect(component).toMatchSnapshot();
  });

  it("renders properly edit and major mine require both wrong role", () => {
    const props = { ...baseProps, isMajorMine: true, permission: PERMISSIONS.EDIT_DO };
    const { container: component } = render(
      <AuthorizationWrapper {...props}>{children}</AuthorizationWrapper>
    );
    expect(component).toMatchSnapshot();
  });

  it("renders properly edit and major mine require both NOT Major", () => {
    const props = { ...baseProps, isMajorMine: false, permission: PERMISSIONS.EDIT_MINES };
    const { container: component } = render(
      <AuthorizationWrapper {...props}>{children}</AuthorizationWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
