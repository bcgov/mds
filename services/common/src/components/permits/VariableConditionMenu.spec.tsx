import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import VariableConditionMenu from "./VariableConditionMenu";

describe("VariableConditionMenu", () => {
  it("renders correctly and matches the snapshot", () => {
    const { container } = render(
      <ReduxWrapper>
        <VariableConditionMenu conditionForm="MOCK_CONDITION_FORM" isManagementView />
      </ReduxWrapper>
    );
    fireEvent.click(container.querySelector("button"));
    expect(container.firstChild).toMatchSnapshot();
  });
});
