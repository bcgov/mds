import React from "react";
import { render } from "@testing-library/react";
import { AddContactModal } from "@/components/modalContent/contacts/AddContactModal";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const dispatchProps = {
  onCancel: jest.fn(),
  onSubmit: jest.fn(),
};

describe("AddContactModal", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <AddContactModal {...dispatchProps} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
