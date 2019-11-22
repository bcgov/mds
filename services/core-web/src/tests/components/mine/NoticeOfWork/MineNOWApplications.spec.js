import React from "react";
import { shallow } from "enzyme";
import { MineNOWApplications } from "@/components/mine/NoticeOfWork/MineNOWApplications";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.mineGuid = MOCK.NOW.applications[0].mine_guid;
  props.history = { push: jest.fn() };
  props.location = { search: "" };
  props.noticeOfWorkApplications = MOCK.NOW.applications;
  props.mineRegionHash = MOCK.REGION_HASH;
};

const setupDispatchProps = () => {
  props.fetchRegionOptions = jest.fn(() => Promise.resolve());
  props.fetchMineNoticeOfWorkApplications = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MineNOWApplications", () => {
  it("renders properly", () => {
    const component = shallow(<MineNOWApplications {...props} />);
    expect(component).toMatchSnapshot();
  });
});
