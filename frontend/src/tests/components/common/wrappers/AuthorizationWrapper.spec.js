import React from "react";
import { shallow } from "enzyme";
import { AuthorizationWrapper } from "@/components/common/wrappers/AuthorizationWrapper";
import * as Mock from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.permission = "role_admin";
  props.isMajorMine = true;
  props.userRoles = Mock.USER_ACCESS_DATA;
  props.children = <div>helo</div>;
};

beforeEach(() => {
  setupProps();
});

describe("AuthorizationWrapper", () => {
  it("renders properly", () => {
    const wrapper = shallow(<AuthorizationWrapper {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
