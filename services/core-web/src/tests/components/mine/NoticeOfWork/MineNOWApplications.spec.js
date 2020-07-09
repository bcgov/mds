import React from "react";
import { shallow } from "enzyme";
import { MineNOWApplications } from "@/components/mine/NoticeOfWork/MineNOWApplications";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mineGuid = MOCK.NOW.applications[0].mine_guid;
  props.mines = { [MOCK.NOW.applications[0].mine_guid]: { major_mine_ind: true } };
  props.history = { replace: jest.fn() };
  props.location = { search: "" };
  props.noticeOfWorkApplications = MOCK.NOW.applications;
  props.mineRegionHash = MOCK.REGION_HASH;
};

const setupDispatchProps = () => {
  dispatchProps.fetchRegionOptions = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineNoticeOfWorkApplications = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MineNOWApplications", () => {
  it("renders properly", () => {
    const component = shallow(<MineNOWApplications {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
