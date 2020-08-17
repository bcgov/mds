import React from "react";
import { shallow } from "enzyme";
import { NOWDocuments } from "@/components/noticeOfWork/applications/NOWDocuments";
import * as NOWMocks from "@/tests/mocks/noticeOfWorkMocks";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.arrayPush = jest.fn();
};

const setupProps = () => {
  props.now_application_guid = "145134613";
  props.mine_guid = "2456345";
  props.documents = [];
  props.noticeOfWorkApplicationDocumentTypeOptionsHash = NOWMocks.APPLICATION_DOCUMENT_TYPES_HASH;
  props.isViewMode = false;
  props.selectedRows = null;
  props.categoriesToShow = ["ANS", "OTH"];
  props.disclaimerText = "This test is explaining the purpose of this section";
  props.isAdminView = false;
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
