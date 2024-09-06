import React from "react";
import { MineTailingsInfoTabs } from "@/components/mine/Tailings/MineTailingsInfoTabs";
import * as MOCK from "@/tests/mocks/dataMocks";
import { AUTHENTICATION, SystemFlagEnum, USER_ROLES } from "@mds/common";
import { REPORTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

const props: any = {};
const dispatchProps: any = {};

const initialState: any = {
  [REPORTS]: { mineReports: MOCK.MINE_REPORTS, reportsPageData: MOCK.PAGE_DATA },
  [STATIC_CONTENT]: MOCK.BULK_STATIC_CONTENT_RESPONSE,
  [AUTHENTICATION]: {
    systemFlag: SystemFlagEnum.core,
    userAccessData: [USER_ROLES.role_minespace_proponent, USER_ROLES.role_edit_tsf],
  },
};

jest.mock("@mds/common/providers/featureFlags/useFeatureFlag", () => ({
  useFeatureFlag: () => ({
    isFeatureEnabled: () => true,
  }),
}));

const setupProps = () => {
  props.mines = MOCK.MINES.mines;
  [props.mineGuid] = MOCK.MINES.mineIds;
  props.mineReports = [];

  props.TSFOperatingStatusCodeHash = {};
  props.consequenceClassificationStatusCodeHash = {};
  props.enabledTabs = ["reports", "map", "tsf"];
  props.userRoles = [USER_ROLES.role_minespace_proponent];
};

const setupDispatchProps = () => {
  dispatchProps.updateMineRecord = jest.fn();
  dispatchProps.updateMineReport = jest.fn();
  dispatchProps.deleteMineReport = jest.fn();
  dispatchProps.createTailingsStorageFacility = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn();
  dispatchProps.fetchMineReports = jest.fn(() => Promise.resolve());
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn();
  dispatchProps.fetchPartyRelationships = jest.fn();
  dispatchProps.updateTailingsStorageFacility = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MineTailingsInfoTabs", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <MineTailingsInfoTabs {...props} {...dispatchProps} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
