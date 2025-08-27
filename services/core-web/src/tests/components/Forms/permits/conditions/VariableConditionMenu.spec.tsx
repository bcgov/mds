import React from "react";
import { render } from "@testing-library/react";
import { VariableConditionMenuOld } from "@/components/Forms/permits/conditions/VariableConditionMenuOld";

const dispatchProps = {};
const props = {
  reclamationSummary: [],
  activityTypeOptions: [],
  isManagementView: false,
};

describe("VariableConditionMenu", () => {
  it("renders properly", () => {
    const { container: component } = render(<VariableConditionMenuOld {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
