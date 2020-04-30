import React from "react";
import { shallow } from "enzyme";
import { FinalPermitDocuments } from "@/components/noticeOfWork/applications/FinalPermitDocuments";
import * as MOCK from "@/tests/mocks/dataMocks";
import { IMPORTED_NOTICE_OF_WORK } from "@/tests/mocks/noticeOfWorkMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.setNoticeOfWorkApplicationDocumentDownloadState = jest.fn();
  dispatchProps.updateNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.openModal = jest.fn();
};

const setupProps = () => {
  props.documents = [];
  [props.mineGuid] = MOCK.MINES.mineIds;
  props.noticeOfWork = IMPORTED_NOTICE_OF_WORK;
  props.documentDownloadState = { downloading: false, currentFile: 1, totalFiles: 1 };
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("FinalPermitDocuments", () => {
  it("renders properly", () => {
    const component = shallow(<FinalPermitDocuments {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
