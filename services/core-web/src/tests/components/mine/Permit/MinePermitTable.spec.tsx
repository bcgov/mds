import React from "react";
import { MinePermitTable } from "@/components/mine/Permit/MinePermitTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      id: "18133c75-49ad-4101-85f3-a43e35ae989a",
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

describe("MinePermitTable", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper>
        <BrowserRouter>
          <MinePermitTable
            isLoaded
            permits={MOCK.PERMITS}
            openEditPermitModal={jest.fn()}
            openEditAmendmentModal={jest.fn()}
            openEditSitePropertiesModal={jest.fn()}
            openAddPermitAmendmentModal={jest.fn()}
            openAddPermitHistoricalAmendmentModal={jest.fn()}
            openAddAmalgamatedPermitModal={jest.fn()}
            handlePermitAmendmentIssueVC={jest.fn()}
            expandedRowKeys={[]}
            onExpand={jest.fn()}
            handleDeletePermit={jest.fn()}
            handleDeletePermitAmendment={jest.fn()}
            openViewConditionModal={jest.fn()}
          />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
