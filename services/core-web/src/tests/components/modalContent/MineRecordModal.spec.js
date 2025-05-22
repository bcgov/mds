import React from "react";
import { render } from "@testing-library/react";
import { MineRecordModal } from "@/components/modalContent/MineRecordModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.mineStatusOptions = MOCK.STATUS_OPTIONS.records;
  props.mineRegionOptions = MOCK.REGION_DROPDOWN_OPTIONS;
  props.initialValues = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MineRecordModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><MineRecordModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
