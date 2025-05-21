import React from "react";
import { render } from "@testing-library/react";
import { AdminPermitConditionManagement } from "@/components/admin/permitConditions/AdminPermitConditionManagement";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => { };

const setupProps = () => {
  props.location = {
    pathname: "",
  };
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AdminPermitConditionManagement", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><BrowserRouter><AdminPermitConditionManagement {...dispatchProps} {...props} /></BrowserRouter></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
