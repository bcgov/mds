import React from "react";
import { render } from "@testing-library/react";
import { AddContactForm } from "@/components/Forms/contacts/AddContactForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { MinePartyAppointmentTypeCodeEnum } from "@mds/common/constants/enums";

describe("AddContactForm", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper>
        <AddContactForm
          mine_party_appt_type_code={MinePartyAppointmentTypeCodeEnum.AGT}
          onSubmit={jest.fn()}
        />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
