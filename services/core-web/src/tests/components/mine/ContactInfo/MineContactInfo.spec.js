import React from "react";
import { shallow } from "enzyme";
import { MineContactInfo } from "@/components/mine/ContactInfo/MineContactInfo";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchParties = jest.fn();
  dispatchProps.createParty = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.match = { params: { id: "18133c75-49ad-4101-85f3-a43e35ae989a" } };
  reducerProps.mineGuid = "18133c75-49ad-4101-85f3-a43e35ae989a";
  reducerProps.mines = MOCK.MINES.mines;
  reducerProps.permittees = MOCK.PERMITTEE.permittees;
  reducerProps.permitteeIds = MOCK.PERMITTEE.permitteeIds;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("MineContactInfo", () => {
  it("renders properly", () => {
    const component = shallow(<MineContactInfo {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
