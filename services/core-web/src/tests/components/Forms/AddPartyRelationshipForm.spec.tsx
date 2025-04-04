import React from "react";
import { render } from "@testing-library/react";
import AddPartyRelationshipForm from "@/components/Forms/PartyRelationships/AddPartyRelationshipForm";
import * as MOCK from "@/tests/mocks/dataMocks";
import { MinePartyAppointmentTypeCodeEnum } from "@mds/common/constants/enums";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { STATIC_CONTENT } from "@mds/common/constants/reducerTypes";


const initialState = {
  [STATIC_CONTENT]: MOCK.BULK_STATIC_CONTENT_RESPONSE
};

describe("AddPartyRelationshipForm", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <AddPartyRelationshipForm
          onSubmit={jest.fn()}
          title={"Test Title"}
          mine_party_appt_type_code={MinePartyAppointmentTypeCodeEnum.AGT}
          mine={MOCK.MINES.mines[MOCK.MINES.mineIds[0]]}
          minePermits={[]}
        /></ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
