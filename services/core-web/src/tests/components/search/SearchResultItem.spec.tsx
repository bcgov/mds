import React from "react";
import { shallow } from "enzyme";
import { List, Popover } from "antd";
import { SearchResultItem } from "@/components/search/GlobalSearch/components/SearchResultItem";

const mockOnClick = jest.fn();
const mockOnMouseEnter = jest.fn();

const defaultProps = {
  index: 0,
  selectedIndex: -1,
  searchTerm: "test",
  onClick: mockOnClick,
  onMouseEnter: mockOnMouseEnter,
};

const mineResult = {
  type: "mine",
  score: 1.0,
  result: {
    id: "mine-guid-1",
    value: "Test Mine",
    description: "Mine #: M-001",
    highlight: null,
    mine_guid: "mine-guid-1",
    mines: null,
  },
};

const singleMinePermit = {
  type: "permit",
  score: 1.0,
  result: {
    id: "permit-guid-1",
    value: "CX-123",
    description: "Jane Smith | Status: APP",
    highlight: null,
    mine_guid: "mine-guid-1",
    mines: [{ mine_guid: "mine-guid-1", mine_name: "Mine One" }],
  },
};

const multiMinePermit = {
  type: "permit",
  score: 1.0,
  result: {
    id: "permit-guid-2",
    value: "CX-456",
    description: "John Doe | Status: APP",
    highlight: null,
    mine_guid: "mine-guid-1",
    mines: [
      { mine_guid: "mine-guid-1", mine_name: "Mine One" },
      { mine_guid: "mine-guid-2", mine_name: "Mine Two" },
    ],
  },
};

describe("SearchResultItem", () => {
  it("renders properly for a non-permit result", () => {
    const component = shallow(<SearchResultItem item={mineResult as any} {...defaultProps} />);
    expect(component).toMatchSnapshot();
  });

  it("does not show multi-mine indicator for a single-mine permit", () => {
    const component = shallow(<SearchResultItem item={singleMinePermit as any} {...defaultProps} />);
    expect(component.find("button").length).toBe(0);
  });

  it("shows multi-mine indicator for a permit with multiple mines", () => {
    const component = shallow(<SearchResultItem item={multiMinePermit as any} {...defaultProps} />);
    const description = shallow(<div>{component.find(List.Item.Meta).prop("description")}</div>);
    expect(description.find("button").length).toBe(1);
    expect(description.find("button").text()).toContain("Associated with 2 Mines");
  });

  it("renders a popover for multi-mine permits", () => {
    const component = shallow(<SearchResultItem item={multiMinePermit as any} {...defaultProps} />);
    const description = shallow(<div>{component.find(List.Item.Meta).prop("description")}</div>);
    expect(description.find(Popover).length).toBe(1);
  });

  it("calls stopPropagation when the mine indicator button is clicked", () => {
    const component = shallow(<SearchResultItem item={multiMinePermit as any} {...defaultProps} />);
    const description = shallow(<div>{component.find(List.Item.Meta).prop("description")}</div>);
    const mockEvent = { stopPropagation: jest.fn() };
    description.find("button").simulate("click", mockEvent);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });
});
