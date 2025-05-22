import React from "react";
import { render } from "@testing-library/react";
import { USER_ROLES } from "@mds/common/constants/environment";
import { AuthorizationWrapper } from "@/components/common/wrappers/AuthorizationWrapper";
import * as PERMISSIONS from "@/constants/permissions";

let props = {};

const setupProps = () => {
  props.userRoles = [
    USER_ROLES[PERMISSIONS.VIEW_ALL],
    USER_ROLES[PERMISSIONS.EDIT_MINES],
    USER_ROLES[PERMISSIONS.EDIT_REPORTS],
  ];
  props.children = <div>hello</div>;
};
beforeEach(() => {
  props = {};
  setupProps();
});

describe("AuthorizationWrapper", () => {
  it("empty params ", () => {
    const { container: component } = render(<AuthorizationWrapper {...props} />);
    expect(component).toMatchSnapshot();

  });
});

describe("AuthorizationWrapper", () => {
  it("renders major mine properly", () => {
    props.isMajorMine = true;
    const { container: component } = render(<AuthorizationWrapper {...props} />);
    expect(component).toMatchSnapshot();
  });
});

describe("AuthorizationWrapper", () => {
  it("renders properly admin overrides is major mine", () => {
    props.userRoles.push(USER_ROLES[PERMISSIONS.ADMIN]);
    props.isMajorMine = true;
    const { container: component } = render(<AuthorizationWrapper {...props} />);
    expect(component).toMatchSnapshot();
  });
});

describe("AuthorizationWrapper", () => {
  it("renders properly edit and major mine require both success", () => {
    // set to value in userRoles
    props.permission = PERMISSIONS.EDIT_MINES;
    props.isMajorMine = true;

    const { container: component } = render(<AuthorizationWrapper {...props} />);
    expect(component).toMatchSnapshot();
  });
});

describe("AuthorizationWrapper", () => {
  it("renders properly edit and major mine require both wrong role", () => {
    props.isMajorMine = true;
    // set to value NOT IN userRoles
    props.permission = PERMISSIONS.EDIT_DO;
    const { container: component } = render(<AuthorizationWrapper {...props} />);
    expect(component).toMatchSnapshot();
  });
});

describe("AuthorizationWrapper", () => {
  it("renders properly edit and major mine require both NOT Major", () => {
    // set to value in userRoles
    props.isMajorMine = false;
    props.permission = PERMISSIONS.EDIT_MINES;
    const { container: component } = render(<AuthorizationWrapper {...props} />);
    expect(component).toMatchSnapshot();
  });
});
