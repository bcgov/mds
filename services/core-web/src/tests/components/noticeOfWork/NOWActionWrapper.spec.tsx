import React from "react";
import { render } from "@testing-library/react";
import { NOWActionWrapper } from "@/components/noticeOfWork/NOWActionWrapper";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const reducerProps: any = {
  children: <div>test</div>,
  history: { push: jest.fn() },
  progress: {},
  tab: "application",
  noticeOfWork: { notice_of_work_type_code: "PLA", application_type_code: "NOW" },
  applicationDelay: {},
  allowAfterProcess: true,
  location: {
    pathname: "mock path name",
  },
  isDisabledReviewButton: true,
};

describe("NOWActionWrapper", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><NOWActionWrapper {...reducerProps} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
