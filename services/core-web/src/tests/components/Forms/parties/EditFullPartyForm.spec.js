import React from "react";
import { render } from "@testing-library/react";
import { EditFullPartyForm } from "@/components/Forms/parties/EditFullPartyForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

describe("EditFullPartyForm", () => {
  it("renders properly", () => {
    const { container } = render(<ReduxWrapper><EditFullPartyForm
      onSubmit={jest.fn()}
      isPerson={false}
      provinceOptions={MOCK.DROPDOWN_PROVINCE_OPTIONS}
      initialValues={{}}
      party={MOCK.PARTY.parties[MOCK.PARTY.partyIds[0]]}
    /></ReduxWrapper>);
    expect(container).toMatchSnapshot();
  });
});
