import React from "react";
import { render } from "@testing-library/react";
import { MergePartyConfirmationForm } from "@/components/Forms/parties/MergePartyConfirmationForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

describe("MergePartyConfirmationForm", () => {
  it("renders properly", () => {
    const { container } = render(<ReduxWrapper><MergePartyConfirmationForm
      onSubmit={jest.fn()}
      isPerson={false}
      title={"Merge Contact"}
      submitting={false}
      provinceOptions={MOCK.DROPDOWN_PROVINCE_OPTIONS}
      initialValues={{}}
      party={MOCK.PARTY.parties[MOCK.PARTY.partyIds[0]]}
      roles={[]}
      partyRelationshipTypesHash={{}}
    /></ReduxWrapper>);
    expect(container).toMatchSnapshot();
  });
});
