import React from "react";
import { render } from "@testing-library/react";
import { AddFullPartyForm } from "@/components/Forms/parties/AddFullPartyForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";


describe("AddFullPartyForm", () => {
  it("renders properly", () => {
    const { container } = render(<ReduxWrapper><AddFullPartyForm
      togglePartyChange={jest.fn()}
      isPerson={false}
      provinceOptions={MOCK.DROPDOWN_PROVINCE_OPTIONS}
    /></ReduxWrapper>);
    expect(container).toMatchSnapshot();
  });
});
