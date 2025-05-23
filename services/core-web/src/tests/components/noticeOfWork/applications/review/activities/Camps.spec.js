import React from "react";
import { render } from "@testing-library/react";
import { Camps } from "@/components/noticeOfWork/applications/review/activities/Camps";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const reducerProps = {
  isViewMode: true,
  initialValues: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.camp,
  editRecord: jest.fn(),
  addRecord: jest.fn(),
  campFormValues: {
    has_fuel_stored: false,
  },
  renderOriginalValues: jest.fn().mockReturnValue({ value: "N/A", edited: true }),
};

describe("Camps", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><FormWrapper name="formName"><Camps {...reducerProps} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
