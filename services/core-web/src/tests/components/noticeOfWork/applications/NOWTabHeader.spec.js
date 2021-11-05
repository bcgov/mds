import React from "react";
import { shallow } from "enzyme";
import { NOWTabHeader } from "@/components/noticeOfWork/applications/NOWTabHeader";
import * as NOWMocks from "@/tests/mocks/noticeOfWorkMocks";

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
    const component = shallow(<NOWTabHeader {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
