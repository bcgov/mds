import React from "react";
import { render } from "@testing-library/react";
import { ReclamationSummary } from "@/components/noticeOfWork/applications/review/activities/ReclamationSummary";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.reclamationSummary = NOW_MOCK.RECLAMATION_SUMMARY;
};

beforeEach(() => {
  setupReducerProps();
});

describe("ReclamationSummary", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReclamationSummary {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
