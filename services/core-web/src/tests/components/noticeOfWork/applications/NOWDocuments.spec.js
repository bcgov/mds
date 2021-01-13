import React from "react";
import { shallow } from "enzyme";
import { NOWDocuments } from "@/components/noticeOfWork/applications/NOWDocuments";
import * as NOWMocks from "@/tests/mocks/noticeOfWorkMocks";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.updateNoticeOfWorkApplication = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
};

const setupProps = () => {
  props.noticeOfWork = NOWMocks.IMPORTED_NOTICE_OF_WORK;
  props.documents = [];
  props.noticeOfWorkApplicationDocumentTypeOptions = NOWMocks.DROPDOWN_APPLICATION_DOCUMENT_TYPES;
  props.isViewMode = false;
  props.selectedRows = null;
  props.categoriesToShow = ["ANS", "OTH"];
  props.disclaimerText = "This test is explaining the purpose of this section";
  props.isAdminView = false;
  props.addDescriptionColumn = true;
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("NOWDocuments", () => {
  it("renders properly", () => {
    const component = shallow(<NOWDocuments {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
