import React from "react";
import { render } from "@testing-library/react";
import { EditPartyModal } from "@/components/modalContent/EditPartyModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { PARTIES } from "@mds/common/constants/reducerTypes";

const dispatchProps = {
  onSubmit: jest.fn(),
};

const initialState = {
  [PARTIES]: { parties: MOCK.PARTY.parties },
};

const props = {
  partyGuid: MOCK.PARTY.partyIds[0],
};

describe("EditPartyModal", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper initialState={initialState}>
        <EditPartyModal {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
