import React from "react";
import { shallow } from "enzyme";
import { SettlingPonds } from "@/components/noticeOfWork/applications/review/activities/SettlingPonds";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.initialValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK.settling_pond;
};

beforeEach(() => {
  setupReducerProps();
});

describe("SettlingPonds", () => {
  it("renders properly", () => {
    const component = shallow(<SettlingPonds {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
