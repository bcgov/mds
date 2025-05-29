import React from "react";
import { render } from "@testing-library/react";
import { MineRecordForm } from "@/components/Forms/MineRecordForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
  handleDelete: jest.fn(),
  change: jest.fn(),
};
const props = {
  title: "mockTitle",
  mineStatusOptions: MOCK.STATUS_OPTIONS.records,
  mineRegionOptions: MOCK.REGION_DROPDOWN_OPTIONS,
  mineTenureTypes: MOCK.TENURE_TYPES_DROPDOWN_OPTIONS,
  mineCommodityOptionsHash: MOCK.COMMODITY_OPTIONS_HASH,
  mineDisturbanceOptionsHash: MOCK.DISTURBANCE_OPTIONS_HASH,
  mine_types: MOCK.MINE_TYPES,
  mineTenureHash: MOCK.TENURE_HASH,
  conditionalDisturbanceOptions: MOCK.CONDITIONAL_DISTURBANCE_OPTIONS,
  conditionalCommodityOptions: MOCK.CONDITIONAL_COMMODITY_OPTIONS,
  currentMineTypes: MOCK.MINE_TYPES,
  submitting: false,
};

describe("MineRecordForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <MineRecordForm {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
