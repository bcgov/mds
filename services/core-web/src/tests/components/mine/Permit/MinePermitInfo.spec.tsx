import React from "react";
import { render } from "@testing-library/react";
import { MinePermitInfo } from "@/components/mine/Permit/MinePermitInfo";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { AUTHENTICATION, PERMITS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { USER_ROLES } from "@mds/common";
import { BrowserRouter } from "react-router-dom";

const dispatchProps: any = {};
const props: any = {};

const initialState = {
  [PERMITS]: { permits: MOCK.PERMITS },
  [AUTHENTICATION]: {
    userAccessData: [USER_ROLES.role_admin],
  },
  [STATIC_CONTENT]: {
    permitAmendmentTypeCodeOptions:
      MOCK.BULK_STATIC_CONTENT_RESPONSE.permitAmendmentTypeCodeOptions,
    permitStatusCodes: MOCK.BULK_STATIC_CONTENT_RESPONSE.permitStatusCodes,
  },
};

const setupDispatchProps = () => {
  dispatchProps.fetchPermits = jest.fn(() => Promise.resolve());
  dispatchProps.fetchPermitStatusOptions = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve());
};

const setupProps = () => {
  props.mineGuid = "18145c75-49ad-0101-85f3-a43e45ae989a";
  props.match = { params: { id: "18145c75-49ad-0101-85f3-a43e45ae989a" } };
  props.mines = MOCK.MINES.mines;
  props.explosivesPermits = [];
  props.permits = MOCK.PERMITS;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MinePermitInfo", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <MinePermitInfo {...dispatchProps} {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
