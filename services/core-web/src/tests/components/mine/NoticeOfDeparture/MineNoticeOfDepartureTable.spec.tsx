import React from "react";
import { render } from "@testing-library/react";
import {
  MineNoticeOfDepartureTable,
  MineNoticeOfDepartureTableProps,
} from "@/components/mine/NoticeOfDeparture/MineNoticeOfDepartureTable";
import { NOTICES_OF_DEPARTURE } from "@/tests/mocks/dataMocks";
import matchMedia from "@/tests/mocks/matchMedia";

const props: MineNoticeOfDepartureTableProps = {
  nods: [],
  isLoaded: false,
  sortDir: "desc",
  sortField: "received_date",
  isPaginated: false,
  isDashboardView: false,
  openViewNodModal: () => {},
};
const dispatchProps: Partial<MineNoticeOfDepartureTableProps> = {};

const setupDispatchProps = () => {
  dispatchProps.openViewNodModal = jest.fn();
};

const setupProps = () => {
  props.nods = NOTICES_OF_DEPARTURE.records;
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

beforeAll(() => {
  window.matchMedia = matchMedia;
});

describe("MineNoticeOfDepartureTable", () => {
  it("renders properly", () => {
    const { container } = render(<MineNoticeOfDepartureTable {...dispatchProps} {...props} />);
    expect(container).toMatchSnapshot();
  });
});
