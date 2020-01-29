import React from "react";
import { shallow } from "enzyme";
import { SurfaceBulkSamples } from "@/components/noticeOfWork/applications/review/activities/SurfaceBulkSamples";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.initialValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK.surface_bulk_sample;
  reducerProps.editRecord = jest.fn();
  reducerProps.addRecord = jest.fn();
};

beforeEach(() => {
  setupReducerProps();
});

describe("SurfaceBulkSamples", () => {
  it("renders properly", () => {
    const component = shallow(<SurfaceBulkSamples {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
