import React from "react";
import { render } from "@testing-library/react";
import { UpdateMinespaceUserModal } from "@/components/modalContent/UpdateMinespaceUserModal";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
};
const props = {
  title: "mock title",
  initialValues: { mineNames: [{ mine_guid: "mine-guid" }] },
};

describe("UpdateMinespaceUserModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><UpdateMinespaceUserModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
