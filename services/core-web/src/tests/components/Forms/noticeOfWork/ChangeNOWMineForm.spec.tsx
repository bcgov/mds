import React from "react";
import { render } from "@testing-library/react";
import { ChangeNOWMineForm } from "@/components/Forms/noticeOfWork/ChangeNOWMineForm";
import { NOW } from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
  handleChange: jest.fn(),
  handleSelect: jest.fn(),
  closeModal: jest.fn(),
};
const props = {
  title: "mockTitle",
  submitting: false,
  noticeOfWork: NOW.applications[0],
};

describe("ChangeNOWMineForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <ChangeNOWMineForm {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
