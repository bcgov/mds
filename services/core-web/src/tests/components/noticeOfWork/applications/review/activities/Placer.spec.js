import React from "react";
import { shallow } from "enzyme";
import { Placer } from "@/components/noticeOfWork/applications/review/activities/Placer";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.initialValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK.placer_operation;
};

beforeEach(() => {
  setupReducerProps();
});

describe("Placer", () => {
  it("renders properly", () => {
    const component = shallow(<Placer {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
