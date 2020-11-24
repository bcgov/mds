import React from "react";
import { shallow } from "enzyme";
import { ProcessPermit } from "@/components/noticeOfWork/applications/process/ProcessPermit";
import * as NOWMocks from "@/tests/mocks/noticeOfWorkMocks";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchApplicationDelay = jest.fn();
  dispatchProps.updateNoticeOfWorkStatus = jest.fn();
  dispatchProps.fetchDraftPermitByNOW = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
};

const setupProps = () => {
  props.noticeOfWork = NOWMocks.IMPORTED_NOTICE_OF_WORK;
  props.draftAmendment = NOWMocks.draftAmendment;
  props.progress = [];
  props.progressStatusCodes = [];
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("ProcessPermit", () => {
  it("renders properly", () => {
    const component = shallow(<ProcessPermit {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
