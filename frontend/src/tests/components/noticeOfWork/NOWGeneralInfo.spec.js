import React from "react";
import { shallow } from "enzyme";
import { NOWGeneralInfo } from "@/components/noticeOfWork/NOWGeneralInfo";
import * as MOCK from "@/tests/mocks/noticeOfWorkMocks";

const props = {};

const setupProps = () => {
  props.noticeOfWork = MOCK.NOTICE_OF_WORK;
};

beforeEach(() => {
  setupProps();
});

describe("PartyProfile", () => {
  it("renders properly", () => {
    const component = shallow(<NOWGeneralInfo {...props} />);
    expect(component).toMatchSnapshot();
  });
});
