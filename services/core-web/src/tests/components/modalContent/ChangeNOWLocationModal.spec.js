import React from "react";
import { shallow } from "enzyme";
import { ChangeNOWLocationModal } from "@/components/modalContent/ChangeNOWLocationModal";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve({}));
};

const setupProps = () => {
  props.title = "mockTitle";
  // eslint-disable-next-line prefer-destructuring
  props.noticeOfWork = MOCK.NOW.applications[0];
  // eslint-disable-next-line prefer-destructuring
  props.mineGuid = MOCK.MINES.mineIds[0];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ChangeNOWLocationModal", () => {
  it("renders properly", () => {
    const component = shallow(<ChangeNOWLocationModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
