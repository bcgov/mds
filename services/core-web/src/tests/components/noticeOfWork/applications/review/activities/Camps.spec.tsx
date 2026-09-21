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

  it("renders the Fuel Transportation and Storage table when has_fuel_stored is true, without legacy fuel fields", () => {
    const props = {
      ...reducerProps,
      campFormValues: { has_fuel_stored: true },
    };
    const { container: component } = render(<ReduxWrapper><FormWrapper name="formName"><Camps {...props} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });

  it("renders both the legacy fuel fields and the Fuel Transportation and Storage table when legacy fuel data is present", () => {
    const props = {
      ...reducerProps,
      campFormValues: {
        has_fuel_stored: true,
        has_fuel_stored_in_bulk: false,
        has_fuel_stored_in_barrels: false,
        volume_fuel_stored: "5727.00",
      },
    };
    const { container: component } = render(<ReduxWrapper><FormWrapper name="formName"><Camps {...props} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
