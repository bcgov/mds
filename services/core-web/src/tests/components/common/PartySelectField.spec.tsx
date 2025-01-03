import React from "react";
import { PartySelectField } from "@/components/common/PartySelectField";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { SEARCH, PARTIES } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const initialState = {
  [SEARCH]: { searchValues: { label: "Mock Party", value: "29489218432" } },
  [PARTIES]: MOCK.PARTY.parties[0],
};

describe("PartySelectField", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper name="test_party_select" isEditMode={false} onSubmit={jest.fn()}>
          <PartySelectField validate={[]} allowAddingParties={true} name="test" />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
