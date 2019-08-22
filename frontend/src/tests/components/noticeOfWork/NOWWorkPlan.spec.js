import React from "react";
import { shallow } from "enzyme";
import { NOWWorkPlan } from "@/components/noticeOfWork/NOWWorkPlan";
import * as MOCK from "@/tests/mocks/noticeOfWorkMocks";

const props = {};

const setupProps = () => {
  props.noticeOfWork = MOCK.NOTICE_OF_WORK;
};

beforeEach(() => {
  setupProps();
});

describe("NOWWorkPlan", () => {
  it("renders properly", () => {
    const component = shallow(<NOWWorkPlan {...props} />);
    expect(component).toMatchSnapshot();
  });
});
