import React from "react";
import { render } from "@testing-library/react";
import { MineApplications } from "@/components/mine/NoticeOfWork/MineApplications";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mineGuid = MOCK.NOW.applications[0].mine_guid;
  props.mines = { [MOCK.NOW.applications[0].mine_guid]: { major_mine_ind: true } };
  props.history = { replace: jest.fn() };
  props.location = { search: "" };
  props.noticeOfWorkApplications = MOCK.NOW.applications;
  props.mineRegionHash = MOCK.REGION_HASH;
  props.explosivesPermits = [];
};

const setupDispatchProps = () => {
  dispatchProps.fetchRegionOptions = jest.fn(() => Promise.resolve());
  dispatchProps.fetchExplosivesPermits = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineNoticeOfWorkApplications = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MineApplications", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><MineApplications {...props} {...dispatchProps} /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
