import React from "react";
import { shallow } from "enzyme";
import { NOWReasonForDelay } from "@/components/noticeOfWork/applications/NOWReasonForDelay";
import * as NOWMocks from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  [reducerProps.applicationDelay] = NOWMocks.NOW_APPLICATION_DELAY;
  reducerProps.delayTypeOptionsHash = {};
};

beforeEach(() => {
  setupReducerProps();
});

describe("NOWReasonForDelay", () => {
  it("renders properly", () => {
    const component = shallow(<NOWReasonForDelay {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
