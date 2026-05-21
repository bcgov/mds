import React from "react";
import { render } from "@testing-library/react";
import NowApplicationDocumentSearch from "@/components/noticeOfWork/applications/search/NowApplicationDocumentSearch";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

jest.mock("@/components/mine/Permit/Search/components/SearchBox", () => () => <div />);
jest.mock("@/components/mine/Permit/Search/components/SearchResults", () => () => <div />);
jest.mock("@/components/noticeOfWork/applications/search/NowDocumentResultItem", () => () => <div />);

describe("NowApplicationDocumentSearch", () => {
  const initialState = {
    nowApplicationSearch: {
      results: null,
      loading: false,
      documentLoading: false,
      aiLoading: false,
      indexing: false,
      cancelling: false,
      indexerStatus: {
        status: "success",
        items_processed: 10,
        error_count: 0
      },
      indexerStatusLoading: false,
      query: "",
      filters: [],
      allFacets: {},
      nowApplicationGuid: "now-guid"
    }
  };

  it("renders splash screen when no results", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <NowApplicationDocumentSearch nowApplicationGuid={""} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });

  it("renders results when they exist", () => {
    const stateWithResults = {
      nowApplicationSearch: {
        ...initialState.nowApplicationSearch,
        results: {
          documents: [{ id: "1", content: "test" }],
          prompt: null
        }
      }
    };
    const { container } = render(
      <ReduxWrapper initialState={stateWithResults}>
        <NowApplicationDocumentSearch nowApplicationGuid={""} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });

  it("renders in indexing state", () => {
    const stateIndexing = {
      nowApplicationSearch: {
        ...initialState.nowApplicationSearch,
        indexing: true,
        indexerStatus: {
            status: "running",
            percent: 45
        }
      }
    };
    const { container } = render(
      <ReduxWrapper initialState={stateIndexing}>
        <NowApplicationDocumentSearch nowApplicationGuid={""} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
