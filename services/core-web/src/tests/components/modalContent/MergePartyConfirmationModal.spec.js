import React from "react";
import { render } from "@testing-library/react";
import { MergePartyConfirmationModal } from "@/components/modalContent/MergePartyConfirmationModal";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
};
const props = {
  title: "mockTitle",
  initialValues: {},
  provinceOptions: [],
  isPerson: false,
  partyRelationshipTypesHash: {},
  roles: [],
};

describe("MergePartyConfirmationModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><MergePartyConfirmationModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
