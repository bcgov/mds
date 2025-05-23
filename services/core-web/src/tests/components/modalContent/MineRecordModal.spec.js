import React from "react";
import { render } from "@testing-library/react";
import { MineRecordModal } from "@/components/modalContent/MineRecordModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
};
const props = {
  title: "mockTitle",
  mineStatusOptions: MOCK.STATUS_OPTIONS.records,
  mineRegionOptions: MOCK.REGION_DROPDOWN_OPTIONS,
  initialValues: {},
};

describe("MineRecordModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><MineRecordModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
