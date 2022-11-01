import React from "react";
import { shallow } from "enzyme";
import ReactDOMServer from "react-dom/server";
import { USER_ROLES } from "@mds/common";
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
    const component = shallow(<AuthorizationWrapper {...props} />);
    expect(component.html()).toEqual(
      ReactDOMServer.renderToStaticMarkup(React.createElement("span", null, props.children))
    );
  });
});

describe("AuthorizationWrapper", () => {
  it("renders major mine properly", () => {
    props.isMajorMine = true;
    const component = shallow(<AuthorizationWrapper {...props} />);
    expect(component.html()).toEqual(
      ReactDOMServer.renderToStaticMarkup(React.createElement("span", null, props.children))
    );
  });
});

describe("AuthorizationWrapper", () => {
  it("renders properly admin overrides is major mine", () => {
    props.userRoles.push(USER_ROLES[PERMISSIONS.ADMIN]);
    props.isMajorMine = true;
    const component = shallow(<AuthorizationWrapper {...props} />);
    expect(component.html()).toEqual(
      ReactDOMServer.renderToStaticMarkup(React.createElement("span", null, props.children))
    );
  });
});

describe("AuthorizationWrapper", () => {
  it("renders properly edit and major mine require both success", () => {
    // set to value in userRoles
    props.permission = PERMISSIONS.EDIT_MINES;
    props.isMajorMine = true;

    const component = shallow(<AuthorizationWrapper {...props} />);
    expect(component.html()).toEqual(
      ReactDOMServer.renderToStaticMarkup(React.createElement("span", null, props.children))
    );
  });
});

describe("AuthorizationWrapper", () => {
  it("renders properly edit and major mine require both wrong role", () => {
    props.isMajorMine = true;
    // set to value NOT IN userRoles
    props.permission = PERMISSIONS.EDIT_DO;
    const component = shallow(<AuthorizationWrapper {...props} />);
    expect(component.html()).toEqual(null);
  });
});

describe("AuthorizationWrapper", () => {
  it("renders properly edit and major mine require both NOT Major", () => {
    // set to value in userRoles
    props.isMajorMine = false;
    props.permission = PERMISSIONS.EDIT_MINES;
    const component = shallow(<AuthorizationWrapper {...props} />);
    expect(component.html()).toEqual(null);
  });
});
