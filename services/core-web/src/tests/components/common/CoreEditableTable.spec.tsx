import React from "react";
import { render } from "@testing-library/react";
import { CoreEditableTable } from "@/components/common/CoreEditableTable";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {
  isViewMode: false,
  fieldName: "permit Number",
  fieldID: "123",
  type: "Activity",
  unitTypeHash: {},
  tableContent: [],
};

describe("CoreEditableTable", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <FormWrapper name="test-form">
          <CoreEditableTable {...props} {...dispatchProps} />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
