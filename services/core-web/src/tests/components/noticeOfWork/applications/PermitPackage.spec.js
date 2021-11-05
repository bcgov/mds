import React from "react";
import { shallow } from "enzyme";
import { PermitPackage } from "@/components/noticeOfWork/applications/PermitPackage";
import * as NOWMocks from "@/tests/mocks/noticeOfWorkMocks";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.change = jest.fn();
  dispatchProps.updateNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.setNoticeOfWorkApplicationDocumentDownloadState = jest.fn();
};

const setupProps = () => {
  props.noticeOfWork = NOWMocks.IMPORTED_NOTICE_OF_WORK;
  props.isAdminView = true;
  props.isTableHeaderView = true;
  props.importNowSubmissionDocumentsJob = {};
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("PermitPackage", () => {
  it("renders properly", () => {
    const component = shallow(<PermitPackage {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
