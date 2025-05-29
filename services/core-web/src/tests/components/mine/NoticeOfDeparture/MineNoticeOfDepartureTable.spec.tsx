import React from "react";
import { render } from "@testing-library/react";
import {
  MineNoticeOfDepartureTable,
  MineNoticeOfDepartureTableProps,
} from "@/components/mine/NoticeOfDeparture/MineNoticeOfDepartureTable";
import { NOTICES_OF_DEPARTURE } from "@mds/common/tests/mocks/dataMocks";
import matchMedia from "@/tests/mocks/matchMedia";
import { mine } from "@/customPropTypes/mines";

const props: MineNoticeOfDepartureTableProps = {
  nods: NOTICES_OF_DEPARTURE.records,
  isLoaded: false,
  sortDir: "desc",
  sortField: "received_date",
  isPaginated: false,
  isDashboardView: false,
  openViewNodModal: jest.fn(),
};

beforeAll(() => {
  window.matchMedia = matchMedia;
});

describe("MineNoticeOfDepartureTable", () => {
  it("renders properly", () => {
    const { container } = render(<MineNoticeOfDepartureTable {...props} />);
    expect(container).toMatchSnapshot();
  });
});
