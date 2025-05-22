import React from "react";
import { render } from "@testing-library/react";
import { UpdateMinespaceUserModal } from "@/components/modalContent/UpdateMinespaceUserModal";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.title = "mock title";
  props.initialValues = { mineNames: [{ mine_guid: "mine-guid" }] }
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("UpdateMinespaceUserModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><UpdateMinespaceUserModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
