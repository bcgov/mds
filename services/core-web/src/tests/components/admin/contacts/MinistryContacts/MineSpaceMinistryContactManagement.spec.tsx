import React from "react";
import { render } from "@testing-library/react";
import { MineSpaceMinistryContactManagement } from "@/components/admin/contacts/MinistryContacts/MineSpaceMinistryContactManagement";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { minespaceReducerType } from "@mds/common/redux/slices/minespaceSlice";

jest.mock("@mds/common/redux/slices/minespaceSlice", () => {
  const original = jest.requireActual("@mds/common/redux/slices/minespaceSlice");
  return {
    __esModule: true,
    ...original,
    fetchMinistryContacts: () => () => Promise.resolve(),
    fetchDistributionLists: () => () => Promise.resolve(),
  };
});

const initialState = {
  [minespaceReducerType]: {
    MinistryContacts: [],
    DistributionLists: [],
  },
  [STATIC_CONTENT]: {
    mineRegionOptions: [],
    ministryContactTypes: [],
  },
};

describe("MineSpaceMinistryContactManagement", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <MineSpaceMinistryContactManagement />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
