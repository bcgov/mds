import React from "react";
import { render } from "@testing-library/react";
import { UploadPermitDocumentModal } from "@/components/modalContent/UploadPermitDocumentModal";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
};
const props = {
  title: "Upload Documents",
};

describe("UploadPermitDocumentModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><UploadPermitDocumentModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
