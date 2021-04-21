import React from "react";
import { shallow } from "enzyme";
import { EditNoWContacts } from "@/components/Forms/noticeOfWork/EditNoWContacts";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.arrayRemove = jest.fn();
  dispatchProps.arrayPush = jest.fn();
};

const setupProps = () => {
  props.isEditView = false;
  props.addPartyFormState = {};
  props.partyRelationshipTypesList = [];
  props.contacts = NOW_MOCK.NOTICE_OF_WORK.contacts;
  props.contactFormValues = [];
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("EditNoWContacts", () => {
  it("renders properly", () => {
    const component = shallow(<EditNoWContacts {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
