import React from "react";
import { shallow } from "enzyme";
import { MMPermitApplicationInit } from "@/components/noticeOfWork/applications/applicationStepOne/MMPermitApplicationInit";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchPermits = jest.fn();
  dispatchProps.createNoticeOfWorkApplication = jest.fn(() => Promise.resolve());
};

const setupReducerProps = () => {
  // eslint-disable-next-line prefer-destructuring
  reducerProps.mineGuid = MOCK.MINES.mineIds[0];
  reducerProps.mines = MOCK.MINES.mines;
  reducerProps.minePermits = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("MMPermitApplicationInit", () => {
  it("renders properly", () => {
    const component = shallow(<MMPermitApplicationInit {...reducerProps} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
