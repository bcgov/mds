import React from "react";
import { render } from "@testing-library/react";
import { Blasting } from "@/components/noticeOfWork/applications/review/activities/Blasting";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const reducerProps = {
  isViewMode: true,
  isNewPermit: false,
  mineGuid: "123514251",
  initialValues: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.blasting_operation,
  blastingFormValues: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.blasting_operation,
  editRecord: jest.fn(),
  addRecord: jest.fn(),
  renderOriginalValues: jest.fn().mockReturnValue({ value: "N/A", edited: true }),
};

describe("Blasting", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><FormWrapper name="formName"><Blasting {...reducerProps} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
