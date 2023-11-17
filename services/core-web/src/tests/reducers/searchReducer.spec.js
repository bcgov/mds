import { searchReducer } from "@mds/common/redux/reducers/searchReducer";
import {
  storeSearchOptions,
  storeSearchResults,
  storeSearchBarResults,
  clearSearchBarResults,
} from "@mds/common/redux/actions/searchActions";

const baseExpectedValue = {
  searchOptions: [],
  searchResults: [],
  searchBarResults: [],
  searchTerms: [],
  searchSubsetResults: [],
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("searchReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();

    const result = searchReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_SEARCH_OPTIONS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.searchOptions = {
      model_id: "mine",
      description: "Mines",
    };

    const result = searchReducer(
      undefined,
      storeSearchOptions({
        model_id: "mine",
        description: "Mines",
      })
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_SEARCH_RESULTS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.searchResults = {
      mine: [
        {
          result: {
            mine_guid: "aa3cb08a-ee1b-4dc9-8bf6-f54eb7484d4d",
            mine_name: "Abbott Inc",
            mine_no: "13353605",
            mine_region: "SW",
            mine_permit: [
              {
                permit_guid: "dfbc581b-fedf-415f-9543-b590d8ff9dcc",
                mine_guid: "aa3cb08a-ee1b-4dc9-8bf6-f54eb7484d4d",
                permit_no: "P-1707761",
                mine_name: "Abbott Inc",
                permitee: "Leslie Reed, Bailey and Gomez",
              },
            ],
            mine_status: [
              {
                status_labels: ["Closed", "Unknown"],
              },
            ],
          },
          score: 375,
          type: "mine",
        },
      ],
      party: [],
      permit: [],
      mine_documents: [],
      permit_documents: [],
    };
    expectedValue.searchTerms = ["Abb"];

    const result = searchReducer(
      undefined,
      storeSearchResults({
        search_terms: ["Abb"],
        search_results: {
          mine: [
            {
              result: {
                mine_guid: "aa3cb08a-ee1b-4dc9-8bf6-f54eb7484d4d",
                mine_name: "Abbott Inc",
                mine_no: "13353605",
                mine_region: "SW",
                mine_permit: [
                  {
                    permit_guid: "dfbc581b-fedf-415f-9543-b590d8ff9dcc",
                    mine_guid: "aa3cb08a-ee1b-4dc9-8bf6-f54eb7484d4d",
                    permit_no: "P-1707761",
                    mine_name: "Abbott Inc",
                    permitee: "Leslie Reed, Bailey and Gomez",
                  },
                ],
                mine_status: [
                  {
                    status_labels: ["Closed", "Unknown"],
                  },
                ],
              },
              score: 375,
              type: "mine",
            },
          ],
          party: [],
          permit: [],
          mine_documents: [],
          permit_documents: [],
        },
      })
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_SEARCH_BAR_RESULTS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.searchBarResults = [
      {
        result: {
          id: "aa3cb08a-ee1b-4dc9-8bf6-f54eb7484d4d",
          value: "Abbott Inc",
        },
        score: 375,
        type: "mine",
      },
      {
        result: {
          id: "5a993f02-1006-4a07-a448-f4064294de11",
          value: "Abbott PLC",
        },
        score: 375,
        type: "mine",
      },
    ];

    const result = searchReducer(
      undefined,
      storeSearchBarResults({
        search_terms: ["Abb"],
        search_results: [
          {
            result: {
              id: "aa3cb08a-ee1b-4dc9-8bf6-f54eb7484d4d",
              value: "Abbott Inc",
            },
            score: 375,
            type: "mine",
          },
          {
            result: {
              id: "5a993f02-1006-4a07-a448-f4064294de11",
              value: "Abbott PLC",
            },
            score: 375,
            type: "mine",
          },
        ],
      })
    );
    expect(result).toEqual(expectedValue);
  });

  it("receives CLEAR_SEARCH_BAR_RESULTS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.searchBarResults = [];

    searchReducer(
      undefined,
      storeSearchBarResults({
        search_terms: ["Abb"],
        search_results: [
          {
            result: {
              id: "aa3cb08a-ee1b-4dc9-8bf6-f54eb7484d4d",
              value: "Abbott Inc",
            },
            score: 375,
            type: "mine",
          },
          {
            result: {
              id: "5a993f02-1006-4a07-a448-f4064294de11",
              value: "Abbott PLC",
            },
            score: 375,
            type: "mine",
          },
        ],
      })
    );

    const result = searchReducer(undefined, clearSearchBarResults());
    expect(result).toEqual(expectedValue);
  });
});
