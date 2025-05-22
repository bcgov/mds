import React from "react";
import { render } from "@testing-library/react";
import { SettlingPonds } from "@/components/noticeOfWork/applications/review/activities/SettlingPonds";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.initialValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK.settling_pond;
  reducerProps.editRecord = jest.fn();
  reducerProps.addRecord = jest.fn();
  reducerProps.renderOriginalValues = jest.fn().mockReturnValue({ value: "N/A", edited: true });
};

beforeEach(() => {
  setupReducerProps();
});

describe("SettlingPonds", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><FormWrapper name="formName"><SettlingPonds {...reducerProps} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
