import React from "react";
import { shallow } from "enzyme";
import { MinePermitTable } from "@/components/mine/Permit/MinePermitTable";
import * as MOCK from "@/tests/mocks/dataMocks";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import ViewPermit from "@/components/mine/Permit/ViewPermit";

const dispatchProps: any = {};
const props: any = {};

const setupDispatchProps = () => {
  dispatchProps.openEditPermitModal = jest.fn();
  dispatchProps.openAddPermitAmendmentModal = jest.fn();
  dispatchProps.openAddAmalgamatedPermitModal = jest.fn();
  dispatchProps.openAddPermitHistoricalAmendmentModal = jest.fn();
  dispatchProps.openEditAmendmentModal = jest.fn();
  dispatchProps.onExpand = jest.fn();
  dispatchProps.handleDeletePermit = jest.fn();
  dispatchProps.handleDeletePermitAmendment = jest.fn();
  dispatchProps.handlePermitAmendmentIssueVC = jest.fn();
  dispatchProps.openEditSitePropertiesModal = jest.fn();
  dispatchProps.openViewConditionModal = jest.fn();
};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  props.permits = MOCK.MINES.mines[MOCK.MINES.mineIds[0]].mine_permit_numbers;
  props.partyRelationships = MOCK.PARTYRELATIONSHIPS;
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      id: "18133c75-49ad-4101-85f3-a43e35ae989a",
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MinePermitTable", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper>
        <BrowserRouter>
          <MinePermitTable {...dispatchProps} {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
