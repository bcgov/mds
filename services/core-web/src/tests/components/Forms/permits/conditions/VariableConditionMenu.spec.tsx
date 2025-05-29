import React from "react";
import { render } from "@testing-library/react";
import { VariableConditionMenu } from "@/components/Forms/permits/conditions/VariableConditionMenu";

const dispatchProps = {};
const props = {
  reclamationSummary: [],
  activityTypeOptions: [],
  isManagementView: false,
};

describe("VariableConditionMenu", () => {
  it("renders properly", () => {
    const { container: component } = render(<VariableConditionMenu {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
