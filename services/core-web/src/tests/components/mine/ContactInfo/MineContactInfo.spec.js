import React from "react";
import { render } from "@testing-library/react";
import { MineContactInfo } from "@/components/mine/ContactInfo/MineContactInfo";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

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
    const { container: component } = render(<ReduxWrapper><BrowserRouter><MineContactInfo {...dispatchProps} {...reducerProps} /></BrowserRouter></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
