import React from "react";
import { render } from "@testing-library/react";
import { Equipment } from "@/components/noticeOfWork/applications/review/activities/Equipment";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.equipment = NOW_MOCK.EQUIPMENT;
  reducerProps.isViewMode = false;
  reducerProps.activity = "TEST ACTIVITY";
  reducerProps.editRecord = jest.fn();
  reducerProps.addRecord = jest.fn();
};

beforeEach(() => {
  setupReducerProps();
});

describe("Equipment", () => {
  it("renders view properly", () => {
    const { container: component } = render(<ReduxWrapper><FormWrapper name="formName"><Equipment {...reducerProps} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});

describe("Equipment", () => {
  it("renders edit properly", () => {
    const { container: component } = render(<ReduxWrapper><FormWrapper name="formName"><Equipment isViewMode {...reducerProps} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
