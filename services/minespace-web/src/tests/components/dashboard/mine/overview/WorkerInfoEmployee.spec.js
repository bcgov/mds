import React from "react";
import { shallow } from "enzyme";
import { WorkerInfoEmployee } from "@/components/dashboard/mine/overview/WorkerInfoEmployee";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
};

const setupDispatchProps = () => {
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve());
  dispatchProps.updateMineRecord = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("WorkerInfoEmployee", () => {
  it("renders properly", () => {
    const component = shallow(<WorkerInfoEmployee {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
