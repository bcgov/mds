import React from "react";
import { render } from "@testing-library/react";
import { MergePartyConfirmationForm } from "@/components/Forms/parties/MergePartyConfirmationForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

describe("MergePartyConfirmationForm", () => {
  it("renders properly", () => {
    const { container } = render(<ReduxWrapper><MergePartyConfirmationForm
      onSubmit={jest.fn()}
      isPerson={false}
      title={"Merge Contact"}
      provinceOptions={MOCK.DROPDOWN_PROVINCE_OPTIONS}
      initialValues={{}}
      roles={[]}
      partyRelationshipTypesHash={{}}
    /></ReduxWrapper>);
    expect(container).toMatchSnapshot();
  });
});
