import React from "react";
import { render } from "@testing-library/react";
import { SettlingPonds } from "@/components/noticeOfWork/applications/review/activities/SettlingPonds";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const reducerProps = {
  isViewMode: true,
  initialValues: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.settling_pond,
  editRecord: jest.fn(),
  addRecord: jest.fn(),
  renderOriginalValues: jest.fn().mockReturnValue({ value: "N/A", edited: true }),
};

describe("SettlingPonds", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><FormWrapper name="formName"><SettlingPonds {...reducerProps} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
