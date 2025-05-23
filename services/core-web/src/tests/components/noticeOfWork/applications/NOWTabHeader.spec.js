import React from "react";
import { render } from "@testing-library/react";
import { NOWTabHeader } from "@/components/noticeOfWork/applications/NOWTabHeader";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  handleDraftPermit: jest.fn(),
};
const props = {
  noticeOfWork: NOWMocks.IMPORTED_NOTICE_OF_WORK,
  fixedTop: true,
  isEditMode: true,
  tabActions: <></>,
  tabEditActions: <></>,
  tab: "REV",
  tabName: "application",
  showProgressButton: false,
  isNoticeOfWorkTypeDisabled: true,
  showActionsAndProgress: true,
};

describe("NOWTabHeader", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><BrowserRouter><NOWTabHeader {...props} {...dispatchProps} /></BrowserRouter></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
