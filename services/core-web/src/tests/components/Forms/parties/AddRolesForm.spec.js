import React from "react";
import { render } from "@testing-library/react";
import { AddRolesForm } from "@/components/Forms/parties/AddRolesForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  togglePartyChange: jest.fn(),
};
const props = {
  addField: () => { },
  removeField: () => { },
  handleChange: () => { },
  handleSelect: () => { },
  roleNumbers: [],
  partyRelationshipTypesList: [],
  mineNameList: [],
};

describe("AddFullPartyForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <AddRolesForm {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
