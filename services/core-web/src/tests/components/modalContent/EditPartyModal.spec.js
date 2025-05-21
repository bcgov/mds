import React from "react";
import { render } from "@testing-library/react";
import { EditPartyModal } from "@/components/modalContent/EditPartyModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.oSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.isPerson = true;
  props.provinceOptions = MOCK.DROPDOWN_PROVINCE_OPTIONS;
  props.parties = MOCK.PARTY.parties;
  props.partyGuid = MOCK.PARTY.parties[MOCK.PARTY.partyIds[0]].party_guid;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("EditPartyModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><EditPartyModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
