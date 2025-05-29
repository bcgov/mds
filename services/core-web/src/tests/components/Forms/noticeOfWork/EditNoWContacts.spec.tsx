import React from "react";
import { render } from "@testing-library/react";
import { EditNoWContacts } from "@/components/Forms/noticeOfWork/EditNoWContacts";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  arrayRemove: jest.fn(),
  arrayPush: jest.fn(),
};
const props = {
  isEditView: false,
  addPartyFormState: {},
  partyRelationshipTypesList: [],
  contacts: NOW_MOCK.NOTICE_OF_WORK.contacts,
  contactFormValues: [],
};

describe("EditNoWContacts", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <FormWrapper name="formName">
          <EditNoWContacts {...props} {...dispatchProps} />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
