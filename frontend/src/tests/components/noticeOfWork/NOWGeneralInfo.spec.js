import React from "react";
import { shallow } from "enzyme";
import { NOWGeneralInfo } from "@/components/noticeOfWork/NOWGeneralInfo";
import * as MOCK from "@/tests/mocks/noticeOfWorkMocks";

const props = {};

const setupProps = () => {
  props.noticeOfWork = MOCK.NOTICE_OF_WORK;
  props.regionHash = MOCK.REGION_HASH;
};

beforeEach(() => {
  setupProps();
});

describe("NOWGeneralInfo", () => {
  it("renders properly", () => {
    const component = shallow(<NOWGeneralInfo {...props} />);
    expect(component).toMatchSnapshot();
  });
});
