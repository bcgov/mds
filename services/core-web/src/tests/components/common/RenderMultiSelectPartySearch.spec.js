import React from "react";
import { render } from "@testing-library/react";
import {
  RenderMultiSelectPartySearch,
  DebounceSelect,
} from "@/components/common/RenderMultiSelectPartySearch";

let props = {};

const setupProps = () => {
  props = {
    onSelectedPartySearchResultsChanged: jest.fn(),
    onSearchResultsChanged: jest.fn(),
    onSearchSubsetResultsChanged: jest.fn(),
    partyType: "person",
    fetchSearchResults: jest.fn(),
    triggerSelectReset: false,
    fetchOptions: jest.fn(),
    debounceTimeout: "3000",
  };
};

beforeEach(() => {
  setupProps();
});

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
