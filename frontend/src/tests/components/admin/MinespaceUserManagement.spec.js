import React from "react";
import { shallow } from "enzyme";
import { MinespaceUserManagement } from "@/components/admin/MinespaceUserManagement";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mines = MOCK.MINE_NAME_LIST;
  props.minespaceUsers = MOCK.MINESPACE_USER_LIST;
};

const setupDispatchProps = () => {
  dispatchProps.fetchMineNameList = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMinespaceUsers = jest.fn(() => Promise.resolve());
  dispatchProps.deleteMinespaceUser = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MinespaceUserManagement", () => {
  it("renders properly", () => {
    const component = shallow(<MinespaceUserManagement {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
