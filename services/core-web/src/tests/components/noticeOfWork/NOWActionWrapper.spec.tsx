import React from "react";
import { render } from "@testing-library/react";
import { NOWActionWrapper } from "@/components/noticeOfWork/NOWActionWrapper";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const reducerProps: any = {};

const setupReducerProps = () => {
  reducerProps.children = <></>;
  reducerProps.history = { push: jest.fn() };
  reducerProps.progress = {};
  reducerProps.tab = "application";
  reducerProps.noticeOfWork = { notice_of_work_type_code: "PLA", application_type_code: "NOW" };
  reducerProps.applicationDelay = {};
  reducerProps.allowAfterProcess = true;
  reducerProps.location = {
    pathname: "mock path name",
  };
  reducerProps.isDisabledReviewButton = true;
};

beforeEach(() => {
  setupReducerProps();
});

describe("NOWActionWrapper", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><NOWActionWrapper {...reducerProps} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
