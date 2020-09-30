import React from "react";
import { shallow } from "enzyme";
import { ReviewApplicationFeeContent } from "@/components/noticeOfWork/applications/review/ReviewApplicationFeeContent";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const props = {};

const setupProps = () => {
  props.isViewMode = false;
  props.initialValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK;
};

beforeEach(() => {
  setupProps();
});

describe("ReviewApplicationFeeContent", () => {
  it("renders properly", () => {
    const component = shallow(<ReviewApplicationFeeContent {...props} />);
    expect(component).toMatchSnapshot();
  });

  // it("typeDeterminesFee should return isApplicationFeeValid === true if notice_of_work_type_code === MIN", () => {
  //   const component = shallow(<ReviewApplicationFeeContent {...props} />);
  //   const instance = component.instance();
  //   expect((component.isApplicationFeeValid).toEqual(true));
  // });
});
