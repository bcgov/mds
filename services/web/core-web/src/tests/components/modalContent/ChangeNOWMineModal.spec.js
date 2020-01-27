import React from "react";
import { shallow } from "enzyme";
import { ChangeNOWMineModal } from "@/components/modalContent/ChangeNOWMineModal";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.submit = jest.fn();
  dispatchProps.setMineGuid = jest.fn();
  dispatchProps.fetchMineNameList = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve());
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  // eslint-disable-next-line prefer-destructuring
  props.noticeOfWork = MOCK.NOW.applications[0];
  props.mineNameList = MOCK.MINE_NAME_LIST.mines;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ChangeNOWMineModal", () => {
  it("renders properly", () => {
    const component = shallow(<ChangeNOWMineModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
