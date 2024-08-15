import React from "react";
import { render } from "@testing-library/react";
import CorePageHeader from "./CorePageHeader";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { AUTHENTICATION, MINES, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const initialState = {
  [MINES]: MOCK.MINES,
};

describe("CorePageHeader", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <CorePageHeader
            entityType="Llama"
            entityLabel="George"
            mineGuid={MOCK.MINES.mineIds[0]}
            current_permittee="Permit Holder"
            breadCrumbs={[
              { route: "https://example.com", text: "All Llamas" },
              { route: "https://example.com/specific", text: "Specific Llamas" },
            ]}
            tabProps={{
              items: [
                {
                  key: "overview",
                  label: "Overview",
                  children: <div>Overview Content</div>,
                },
              ],
              defaultActiveKey: "overview",
            }}
          />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
