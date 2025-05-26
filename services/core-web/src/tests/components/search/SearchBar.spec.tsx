import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import SearchBar from "@/components/search/SearchBar";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { store } from "@/App";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {
  fetchSearchBarResults: jest.fn(),
  clearSearchBarResults: jest.fn(),
};
const reducerProps = {
  searchBarResults: MOCK.SIMPLE_SEARCH_RESULTS,
  history: {
    push: jest.fn(),
    location: {},
  },
};
const props = {
  iconPlacement: "prefix",

}

describe("SearchBar", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <Provider store={store}>
          <SearchBar {...dispatchProps} {...reducerProps} />
        </Provider>
      </BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
