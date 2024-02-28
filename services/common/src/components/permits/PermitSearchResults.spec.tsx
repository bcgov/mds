import React from "react";
import PermitSearchResults from "./PermitSearchResults";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { render } from "@testing-library/react";

describe("PermitSearchResults", () => {
  it("should render correctly", () => {
    const searchResults = [
      {
        value: {
          content: "Result 1",
          meta: {
            description: "Description 1",
            document_name: "Document 1",
            issue_date: "2022-01-01",
            mine_name: "Mine 1",
            mine_no: "123",
            name: "Name 1",
            object_store_path: "/path/to/document1",
            permit_no: "456",
            permit_amendment_id: "789",
            highlighted: {
              content: ["Highlighted 1"],
            },
          },
        },
      },
    ];

    const wrapper = render(
      <ReduxWrapper>
        <PermitSearchResults header="Search Results" searchResults={searchResults} />
      </ReduxWrapper>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
