import React from "react";
import { render } from "@testing-library/react";
import { AddVarianceModal } from "@/components/modalContent/AddVarianceModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.mineGuid = "48593";
  props.mineNo = "B01034";
  props.complianceCodes = MOCK.DROPDOWN_HSRCM_CODES;
  props.inspectors = MOCK.PARTY.parties;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddVarianceModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><AddVarianceModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
