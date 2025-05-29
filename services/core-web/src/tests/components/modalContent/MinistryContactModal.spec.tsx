import React from "react";
import { render } from "@testing-library/react";
import { MinistryContactModal } from "@/components/modalContent/MinistryContactModal";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const dispatchProps = {
  oSubmit: jest.fn(),
  closeModal: jest.fn(),
};
const props = {
  initialValues: {},
  regionDropdownOptions: [],
  MinistryContactTypes: [],
  isEdit: true,
  contacts: [],
};

describe("MinistryContactModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><MinistryContactModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
