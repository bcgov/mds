import React from "react";
import MineNoticeOfDeparture from "@/components/mine/NoticeOfDeparture/MineNoticeOfDeparture";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import matchMedia from "@/tests/mocks/matchMedia";
import { renderWithProvider } from "@/tests/mocks/utils";
import { store } from "@/App";
import * as actionTypes from "@mds/common/constants/actionTypes";
import { MemoryRouter } from "react-router-dom";

const dispatchProps: any = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  fetchNoticesOfDeparture: jest.fn(() => Promise.resolve()),
  fetchDetailedNoticeOfDeparture: jest.fn(() => Promise.resolve()),
  fetchPermits: jest.fn(() => Promise.resolve()),
};
const reducerProps: any = {
  mines: MOCK.MINES.mines,
  mineGuid: MOCK.MINES.mineIds[0],
  nods: MOCK.NOTICES_OF_DEPARTURE.records,
};

function mockFunction() {
  // @ts-ignore
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useLocation: jest.fn().mockReturnValue({
      pathname: "/mine/notice-of-departure",
      search: "",
      hash: "",
      state: null,
      key: "5nvxpbdafa",
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

beforeAll(() => {
  window.matchMedia = matchMedia;
});

describe("MineNoticeOfDeparture", () => {
  it("renders properly", () => {
    const { container } = renderWithProvider(
      <MineNoticeOfDeparture {...dispatchProps} {...reducerProps} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders PageNotFound for a regional mine", () => {
    const regionalMineGuid = MOCK.MINES.mineIds[0];
    store.dispatch({
      type: actionTypes.STORE_MINE,
      payload: { ...MOCK.MINES.mines[regionalMineGuid], major_mine_ind: false },
      id: regionalMineGuid,
    });
    const { getByText } = renderWithProvider(
      <MemoryRouter>
        <MineNoticeOfDeparture
          {...dispatchProps}
          {...reducerProps}
          mineGuid={regionalMineGuid}
        />
      </MemoryRouter>
    );
    expect(getByText("Uh Oh!")).toBeInTheDocument();
  });
});
