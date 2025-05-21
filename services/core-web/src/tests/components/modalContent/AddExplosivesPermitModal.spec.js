import React from "react";
import { render } from "@testing-library/react";
import { AddExplosivesPermitModal } from "@/components/modalContent/AddExplosivesPermitModal";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {};

const setupProps = () => {
  props.isApproved = false;
  props.isPermitTab = false;
  props.title = "Permit";
  props.mineGuid = "523642546";
  props.onSubmit = jest.fn();
  props.closeModal = jest.fn();
  props.inspectors = [];
  props.initialValues = {};
  props.documentTypeDropdownOptions = [];
};

beforeEach(() => {
  setupProps();
});

describe("AddExplosivesPermitModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><AddExplosivesPermitModal {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
