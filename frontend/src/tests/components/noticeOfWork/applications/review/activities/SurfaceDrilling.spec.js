import React from "react";
import { shallow } from "enzyme";
import { SurfaceDrilling } from "@/components/noticeOfWork/applications/review/activities/SurfaceDrilling";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.initialValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK.exploration_surface_drilling;
};

beforeEach(() => {
  setupReducerProps();
});

describe("SurfaceDrilling", () => {
  it("renders properly", () => {
    const component = shallow(<SurfaceDrilling {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
