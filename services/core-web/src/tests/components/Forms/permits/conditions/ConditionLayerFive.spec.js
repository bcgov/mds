import React from "react";
import { render } from "@testing-library/react";
import { ConditionLayerFive } from "@/components/Forms/permits/conditions/ConditionLayerFive";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.handleCancel = jest.fn();
  dispatchProps.handleDelete = jest.fn();
  dispatchProps.reorderConditions = jest.fn();
  dispatchProps.setConditionEditingFlag = jest.fn();
};

const setupProps = () => {
  props.condition = { sub_conditions: [] };
  props.new = false;
  props.initialValues = {};
  props.editingConditionFlag = true;
  props.isViewOnly = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: MOCK.IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
}

describe("ConditionLayerFive", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper initialState={initialState}><ConditionLayerFive {...dispatchProps} {...props} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
