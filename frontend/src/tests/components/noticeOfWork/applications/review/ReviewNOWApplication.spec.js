import React from "react";
import { shallow } from "enzyme";
import { ReviewNOWApplication } from "@/components/noticeOfWork/applications/review/ReviewNOWApplication";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.noticeOfWork = NOW_MOCK.IMPORTED_NOTICE_OF_WORK;
  reducerProps.reclamationSummary = NOW_MOCK.RECLAMATION_SUMMARY;
};

beforeEach(() => {
  setupReducerProps();
});

describe("ReviewNOWApplication", () => {
  it("renders properly", () => {
    const component = shallow(<ReviewNOWApplication {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
