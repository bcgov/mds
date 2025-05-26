import React from "react";
import { render } from "@testing-library/react";
import { SurfaceDrilling } from "@/components/noticeOfWork/applications/review/activities/SurfaceDrilling";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const reducerProps = {
  isViewMode: true,
  initialValues: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.exploration_surface_drilling,
  editRecord: jest.fn(),
  addRecord: jest.fn(),
  renderOriginalValues: jest.fn().mockReturnValue({ value: "N/A", edited: true }),
};

describe("SurfaceDrilling", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><FormWrapper name="formName"><SurfaceDrilling {...reducerProps} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
