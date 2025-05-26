import React from "react";
import { render } from "@testing-library/react";
import { AddPartyModal } from "@/components/modalContent/AddPartyModal";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { PROVINCE_OPTIONS } from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {
  submit: jest.fn(),
  fetchData: jest.fn(),
  fetchMineNameList: jest.fn(),
  createParty: jest.fn(),
  reset: jest.fn(),
};
const props = {
  title: "mockTitle",
  addPartyFormValues: {},
  addPartyForm: {},
  provinceOptions: PROVINCE_OPTIONS.records,
};

describe("AddPartyModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><AddPartyModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
