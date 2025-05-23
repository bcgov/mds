import React from "react";
import { render } from "@testing-library/react";
import { ChangeNOWMineModal } from "@/components/modalContent/ChangeNOWMineModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  submit: jest.fn(),
  setMineGuid: jest.fn(),
  fetchMineNameList: jest.fn(),
  fetchMineRecordById: jest.fn(() => Promise.resolve()),
  onSubmit: jest.fn(),
};
const props = {
  title: "mockTitle",
  noticeOfWork: MOCK.NOW.applications[0],
  mineNameList: MOCK.MINE_NAME_LIST.mines,
};

describe("ChangeNOWMineModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><ChangeNOWMineModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
