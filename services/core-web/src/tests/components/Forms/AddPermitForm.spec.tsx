import React from "react";
import { render } from "@testing-library/react";
import { AddPermitForm } from "@/components/Forms/AddPermitForm";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

describe("AddPermitForm", () => {
  it("renders properly", () => {
    const { container } = render(<ReduxWrapper><AddPermitForm
      onSubmit={jest.fn()}
      title={"mockTitle"}
      mine_guid={""}
    /></ReduxWrapper>);
    expect(container).toMatchSnapshot();
  });
});
