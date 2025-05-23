import React from "react";
import { render } from "@testing-library/react";
import { MineAdministrativeAmendmentTable } from "@/components/mine/AdministrativeAmendment/MineAdministrativeAmendmentTable";

const props = {
  handleSearch: jest.fn(),
  administrativeAmendmentApplications: [],
  sortField: undefined,
  sortDir: undefined,
  isLoaded: true,
  location: {
    pathname: "mock pathname",
    search: "mock search",
  },
  onExpand: jest.fn(),
  expandedRowKeys: [],
};

describe("MineAdministrativeAmendmentTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<MineAdministrativeAmendmentTable {...props} />);
    expect(component).toMatchSnapshot();
  });
});
