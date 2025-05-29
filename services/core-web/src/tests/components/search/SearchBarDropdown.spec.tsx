import React from "react";
import { shallow } from "enzyme";
import { SearchBarDropdown } from "@/components/search/SearchBarDropdown";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {
  searchBarResults: MOCK.SIMPLE_SEARCH_RESULTS.search_results,
  searchTerm: MOCK.SIMPLE_SEARCH_RESULTS.search_terms[0],
  searchTermHistory: [""],
  history: {
    push: jest.fn(),
    location: {},
  },
};

describe("SearchBarDropdown", () => {
  it("renders properly", () => {
    const component = shallow(<SearchBarDropdown children={<div test-id="child">Child</div>} {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
