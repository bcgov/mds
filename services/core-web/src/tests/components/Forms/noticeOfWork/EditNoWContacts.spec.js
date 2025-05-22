import React from "react";
import { render } from "@testing-library/react";
import { EditNoWContacts } from "@/components/Forms/noticeOfWork/EditNoWContacts";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

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
    const { container: component } = render(<ReduxWrapper><FormWrapper name="formName"><EditNoWContacts {...props} {...dispatchProps} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
