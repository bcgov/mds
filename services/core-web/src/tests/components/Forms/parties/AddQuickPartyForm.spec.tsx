import React from "react";
import { render } from "@testing-library/react";
import AddQuickPartyForm from "@/components/Forms/parties/AddQuickPartyForm";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

describe("AddQuickPartyForm", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper>
        <AddQuickPartyForm onSubmit={() => {}} isPerson={true} provinceOptions={[]} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
