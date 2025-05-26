import React from "react";
import { render } from "@testing-library/react";
import { MineContactInfo } from "@/components/mine/ContactInfo/MineContactInfo";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  fetchParties: jest.fn(),
  createParty: jest.fn(),
  closeModal: jest.fn(),
  openModal: jest.fn(),
  fetchMineRecordById: jest.fn(),
};
const reducerProps = {
  match: { params: { id: "18133c75-49ad-4101-85f3-a43e35ae989a" } },
  mineGuid: "18133c75-49ad-4101-85f3-a43e35ae989a",
  mines: MOCK.MINES.mines,
  permittees: MOCK.PERMITTEE.permittees,
  permitteeIds: MOCK.PERMITTEE.permitteeIds,
};

describe("MineContactInfo", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><BrowserRouter><MineContactInfo {...dispatchProps} {...reducerProps} /></BrowserRouter></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
