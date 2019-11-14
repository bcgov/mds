import React from "react";
import { shallow } from "enzyme";
import { NOWGeneralInfo } from "@/components/noticeOfWork/submissions/NOWGeneralInfo";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
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
