import React from "react";
import { shallow } from "enzyme";
import { MineNOWApplications } from "@/components/mine/NoticeOfWork/MineNOWApplications";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mines = MOCK.MINES;
  [props.mineGuid] = MOCK.MINES.mineIds;
  props.history = { push: jest.fn() };
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
