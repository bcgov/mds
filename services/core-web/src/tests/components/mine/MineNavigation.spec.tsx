import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MineNavigation from "@/components/mine/MineNavigation";
import { IMine } from "@mds/common/interfaces";

// antd's horizontal Menu only renders submenu contents in a lazily-mounted
// popup/portal on hover, which isn't reliably testable in jsdom. Since what
// we actually want to cover here is MineNavigation's own logic (which menu
// items get included for major vs. regional mines), we replace antd's Menu
// with a simple flattened renderer so every item/child label is present in
// the DOM synchronously.
jest.mock("antd", () => {
  const actual = jest.requireActual("antd");
  const renderItems = (items: any[]) =>
    items
      .filter(Boolean)
      .map((item) => (
        <div key={item.key} data-testid={item.key}>
          {item.label}
          {item.children && renderItems(item.children)}
        </div>
      ));
  return {
    ...actual,
    Menu: ({ items }: { items: any[] }) => <div>{renderItems(items)}</div>,
  };
});

const baseMine = {
  mine_guid: "18133c75-49ad-4101-85f3-a43e35ae989a",
} as IMine;

const props = {
  activeButton: "permits-and-approvals",
  openSubMenuKey: [],
};

const renderMenu = (mine: IMine) =>
  render(
    <MemoryRouter>
      <MineNavigation mine={mine} {...props} />
    </MemoryRouter>
  );

describe("MineNavigation", () => {
  it("renders properly for a major mine", () => {
    const { container } = renderMenu({ ...baseMine, major_mine_ind: true });
    expect(container).toMatchSnapshot();
  });

  it("shows Major Projects and Notices of Departure for a major mine", () => {
    const { getByText } = renderMenu({ ...baseMine, major_mine_ind: true });
    expect(getByText("Major Projects")).toBeInTheDocument();
    expect(getByText("Notices of Departure")).toBeInTheDocument();
  });

  it("hides Major Projects and Notices of Departure for a regional mine", () => {
    const { queryByText } = renderMenu({ ...baseMine, major_mine_ind: false });
    expect(queryByText("Major Projects")).not.toBeInTheDocument();
    expect(queryByText("Notices of Departure")).not.toBeInTheDocument();
  });

  it("still shows mine-type-agnostic menu items for a regional mine", () => {
    const { getByText } = renderMenu({ ...baseMine, major_mine_ind: false });
    expect(getByText("Permits")).toBeInTheDocument();
    expect(getByText("Variances")).toBeInTheDocument();
    expect(getByText("Applications")).toBeInTheDocument();
  });
});
