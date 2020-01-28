import React from "react";
import { shallow } from "enzyme";
import { ReclamationSummary } from "@/components/noticeOfWork/applications/review/activities/ReclamationSummary";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.reclamationSummary = NOW_MOCK.RECLAMATION_SUMMARY;
};

beforeEach(() => {
  setupReducerProps();
});

describe("ReclamationSummary", () => {
  it("renders properly", () => {
    const component = shallow(<ReclamationSummary {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
