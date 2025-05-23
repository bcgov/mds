import React from "react";
import { render } from "@testing-library/react";
import { UpdateNOWDateForm } from "@/components/Forms/noticeOfWork/UpdateNOWDateForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  closeModal: jest.fn(),
  onSubmit: jest.fn(),
};
const props = {
  showCommentFields: false,
  initialValues: {},
  title: "Update Dates",
  recordType: "VER",
  importedDate: "July 1st",
};

describe("UpdateNOWDateForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <UpdateNOWDateForm {...props} {...dispatchProps} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
