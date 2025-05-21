import React from "react";
import { render } from "@testing-library/react";
import { NewMinespaceUser } from "@/components/admin/NewMinespaceUser";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

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
    const { container: component } = render(<ReduxWrapper><NewMinespaceUser {...props} {...dispatchProps} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
