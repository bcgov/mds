import React from "react";
import { render } from "@testing-library/react";
import { NOWTabHeader } from "@/components/noticeOfWork/applications/NOWTabHeader";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.handleDraftPermit = jest.fn();
};

const setupProps = () => {
  props.noticeOfWork = NOWMocks.IMPORTED_NOTICE_OF_WORK;
  props.fixedTop = true;
  props.isEditMode = true;
  props.tabActions = <></>;
  props.tabEditActions = <></>;
  props.tab = "REV";
  props.tabName = "application";
  props.showProgressButton = false;
  props.isNoticeOfWorkTypeDisabled = true;
  props.showActionsAndProgress = true;
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("NOWTabHeader", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><BrowserRouter><NOWTabHeader {...props} {...dispatchProps} /></BrowserRouter></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
