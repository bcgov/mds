import React from "react";
import { render } from "@testing-library/react";
import { WaterSupply } from "@/components/noticeOfWork/applications/review/activities/WaterSupply";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const reducerProps = {
  isViewMode: true,
  initialValues: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.water_supply,
  unitTypeOptions: [],
  renderOriginalValues: jest.fn().mockReturnValue({ value: "N/A", edited: true }),
};

describe("WaterSupply", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><FormWrapper name="formName"><WaterSupply {...reducerProps} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
