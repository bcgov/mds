import React from "react";
import { render } from "@testing-library/react";
import { CoreEditableTable } from "@/components/common/CoreEditableTable";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => { };

const setupProps = () => {
  props.isViewMode = false;
  props.fieldName = "permit Number";
  props.fieldID = "123";
  props.type = "Activity";
  props.unitTypeHash = {};
  props.tableContent = [];
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

// TypeError: tableContent.map is not a function
describe("CoreEditableTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><FormWrapper name="test-form"><CoreEditableTable {...props} {...dispatchProps} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
