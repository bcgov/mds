import React from "react";
import { render } from "@testing-library/react";
import { EditPartyModal } from "@/components/modalContent/EditPartyModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  oSubmit: jest.fn(),
  closeModal: jest.fn(),
};
const props = {
  isPerson: true,
  provinceOptions: MOCK.DROPDOWN_PROVINCE_OPTIONS,
  parties: MOCK.PARTY.parties,
  partyGuid: MOCK.PARTY.partyIds[0],
};

describe("EditPartyModal", () => {
  it("renders properly", () => {
    // @ts-ignore: parties is typed wrong in the component
    const { container: component } = render(<ReduxWrapper><EditPartyModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
