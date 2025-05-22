import React from "react";
import { render } from "@testing-library/react";
import { MechanicalTrenching } from "@/components/noticeOfWork/applications/review/activities/MechanicalTrenching";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.initialValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK.mechanical_trenching;
  reducerProps.editRecord = jest.fn();
  reducerProps.addRecord = jest.fn();
  reducerProps.renderOriginalValues = jest.fn().mockReturnValue({ value: "N/A", edited: true });
};

beforeEach(() => {
  setupReducerProps();
});

describe("MechanicalTrenching", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><FormWrapper name="formName"><MechanicalTrenching {...reducerProps} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
