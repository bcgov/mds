import React from "react";
import { shallow } from "enzyme";
import { Tailings } from "@/components/dashboard/mine/tailings/Tailings";
import * as MOCK from "@/tests/mocks/dataMocks";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: jest.fn(),
  }),
}));

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mine = MOCK.MINES.mines["18133c75-49ad-4101-85f3-a43e35ae989a"];
  props.TSFOperatingStatusCodeHash = {};
  props.consequenceClassificationStatusCodeHash = {};
};

const setupDispatchProps = () => {
  dispatchProps.fetchMineRecordById = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn();
  dispatchProps.updateTailingsStorageFacility = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("Tailings", () => {
  it("renders properly", () => {
    const component = shallow(<Tailings {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
