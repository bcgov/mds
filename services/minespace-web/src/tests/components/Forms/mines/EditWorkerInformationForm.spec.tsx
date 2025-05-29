import React from "react";
import { render } from "@testing-library/react";
import { EditWorkerInformationForm } from "@/components/Forms/mines/EditWorkerInformationForm";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
  handleToggleEdit: jest.fn(),
};
const props = {
  title: "mockTitle",
  submitting: false,
};

describe("EditWorkerInformationForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <EditWorkerInformationForm {...props} {...dispatchProps} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
