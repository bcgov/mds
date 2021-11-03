import React from "react";
import { shallow } from "enzyme";
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
    const wrapper = shallow(<RenderMultiSelectPartySearch {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});

describe("DebounceSelect", () => {
  it("renders properly", () => {
    const wrapper = shallow(<DebounceSelect {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
