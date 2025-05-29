import React from "react";
import { render } from "@testing-library/react";
import { SandGravelQuarry } from "@/components/noticeOfWork/applications/review/activities/SandGravelQuarry";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const reducerProps = {
  isViewMode: true,
  initialValues: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.sand_gravel_quarry_operation,
  editRecord: jest.fn(),
  addRecord: jest.fn(),
  renderOriginalValues: jest.fn().mockReturnValue({ value: "N/A", edited: true }),
};

describe("SandGravelQuarry", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><FormWrapper name="formName"><SandGravelQuarry {...reducerProps} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
