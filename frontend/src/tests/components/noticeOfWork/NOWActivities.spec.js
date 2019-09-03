import React from "react";
import { shallow } from "enzyme";
import { NOWActivities } from "@/components/noticeOfWork/NOWActivities";
import * as MOCK from "@/tests/mocks/noticeOfWorkMocks";

const props = {};

const setupProps = () => {
  props.noticeOfWork = MOCK.NOTICE_OF_WORK;
};

beforeEach(() => {
  setupProps();
});

describe("NOWActivities", () => {
  it("renders properly", () => {
    const component = shallow(<NOWActivities {...props} />);
    expect(component).toMatchSnapshot();
  });
});
