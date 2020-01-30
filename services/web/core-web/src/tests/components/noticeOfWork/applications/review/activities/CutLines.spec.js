import React from "react";
import { shallow } from "enzyme";
import { CutLines } from "@/components/noticeOfWork/applications/review/activities/CutLines";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.initialValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK.cut_lines_polarization_survey;
  reducerProps.editRecord = jest.fn();
  reducerProps.addRecord = jest.fn();
};

beforeEach(() => {
  setupReducerProps();
});

describe("CutLines", () => {
  it("renders properly", () => {
    const component = shallow(<CutLines {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
