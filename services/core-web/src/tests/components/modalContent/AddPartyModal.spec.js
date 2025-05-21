import React from "react";
import { render } from "@testing-library/react";
import { AddPartyModal } from "@/components/modalContent/AddPartyModal";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { PROVINCE_OPTIONS } from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.submit = jest.fn();
  dispatchProps.fetchData = jest.fn();
  dispatchProps.fetchMineNameList = jest.fn();
  dispatchProps.createParty = jest.fn();
  dispatchProps.reset = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.addPartyFormValues = {};
  props.addPartyForm = {};
  props.provinceOptions = PROVINCE_OPTIONS.records
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddPartyModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><AddPartyModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
