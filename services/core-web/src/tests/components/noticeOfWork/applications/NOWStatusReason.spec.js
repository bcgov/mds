import React from "react";
import { shallow } from "enzyme";
import { NOWStatusReason } from "@/components/noticeOfWork/applications/NOWStatusReason";
import * as NOWMocks from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.noticeOfWork = NOWMocks.NOW_APPLICATION_DELAY;
  reducerProps.noticeOfWorkApplicationStatusOptionsHash = NOWMocks.IMPORTED_NOTICE_OF_WORK;
};

beforeEach(() => {
  setupReducerProps();
});

describe("NOWStatusReason", () => {
  it("renders properly", () => {
    const component = shallow(<NOWStatusReason {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
