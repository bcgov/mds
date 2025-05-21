import React from "react";
import { render } from "@testing-library/react";
import { AddContactModal } from "@/components/modalContent/contacts/AddContactModal";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.onCancel = jest.fn();
  dispatchProps.onSubmit = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
});

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
