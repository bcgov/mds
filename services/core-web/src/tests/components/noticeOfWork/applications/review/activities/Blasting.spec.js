import React from "react";
import { render } from "@testing-library/react";
import { Blasting } from "@/components/noticeOfWork/applications/review/activities/Blasting";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.isNewPermit = false;
  reducerProps.mineGuid = "123514251";
  reducerProps.initialValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK.blasting_operation;
  reducerProps.blastingFormValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK.blasting_operation;
  reducerProps.editRecord = jest.fn();
  reducerProps.addRecord = jest.fn();
  reducerProps.renderOriginalValues = jest.fn().mockReturnValue({ value: "N/A", edited: true });
};

beforeEach(() => {
  setupReducerProps();
});

describe("Blasting", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><FormWrapper name="formName"><Blasting {...reducerProps} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
