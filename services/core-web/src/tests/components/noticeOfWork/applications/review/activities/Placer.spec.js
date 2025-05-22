import React from "react";
import { render } from "@testing-library/react";
import { Placer } from "@/components/noticeOfWork/applications/review/activities/Placer";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.initialValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK.placer_operation;
  reducerProps.unitTypeOptions = [{ value: "MED", lable: "Meters cubed/day" }];
  reducerProps.renderOriginalValues = jest.fn().mockReturnValue({ value: "N/A", edited: true });
};

beforeEach(() => {
  setupReducerProps();
});

describe("Placer", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><FormWrapper name="formName"><Placer {...reducerProps} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
