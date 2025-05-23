import React from "react";
import { render } from "@testing-library/react";
import {
  RenderMultiSelectPartySearch,
  DebounceSelect,
} from "@/components/common/RenderMultiSelectPartySearch";

const props = {
  onSelectedPartySearchResultsChanged: jest.fn(),
  onSearchResultsChanged: jest.fn(),
  onSearchSubsetResultsChanged: jest.fn(),
  partyType: "person",
  fetchSearchResults: jest.fn(),
  triggerSelectReset: false,
  fetchOptions: jest.fn(),
  debounceTimeout: "3000",
};

describe("RenderMultiSelectPartySearch", () => {
  it("renders properly", () => {
    const { container: component } = render(<RenderMultiSelectPartySearch {...props} />);
    expect(component).toMatchSnapshot();
  });
});

describe("DebounceSelect", () => {
  it("renders properly", () => {
    const { container: component } = render(<DebounceSelect {...props} />);
    expect(component).toMatchSnapshot();
  });
});
