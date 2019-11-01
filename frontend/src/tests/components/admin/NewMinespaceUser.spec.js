import React from "react";
import { shallow } from "enzyme";
import { NewMinespaceUser } from "@/components/admin/NewMinespaceUser";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mines = MOCK.MINE_NAME_LIST.mines;
};

const setupDispatchProps = () => {
  dispatchProps.fetchMineNameList = jest.fn();
  dispatchProps.fetchMinespaceUsers = jest.fn();
  dispatchProps.createMinespaceUser = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("NewMinespaceUser", () => {
  it("renders properly", () => {
    const component = shallow(<NewMinespaceUser {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
