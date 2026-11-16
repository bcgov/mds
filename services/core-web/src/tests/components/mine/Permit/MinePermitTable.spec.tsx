import React from "react";
import { MinePermitTable } from "@/components/mine/Permit/MinePermitTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { render, screen } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import { IPermit, IPermitPackageFile } from "@mds/common/interfaces";

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

const renderTable = (permits: IPermit[], expandedRowKeys: string[] = []) =>
  render(
      <ReduxWrapper>
        <BrowserRouter>
          <MinePermitTable
            isLoaded
            permits={permits}
            openEditPermitModal={jest.fn()}
            openEditAmendmentModal={jest.fn()}
            openEditSitePropertiesModal={jest.fn()}
            openAddPermitAmendmentModal={jest.fn()}
            openAddPermitHistoricalAmendmentModal={jest.fn()}
            openAddAmalgamatedPermitModal={jest.fn()}
            handlePermitAmendmentIssueVC={jest.fn()}
            handlePermitAmendmentRevokeUNTPCredential={jest.fn()}
            expandedRowKeys={expandedRowKeys}
            onExpand={jest.fn()}
            handleDeletePermit={jest.fn()}
            handleDeletePermitAmendment={jest.fn()}
            openViewConditionModal={jest.fn()}
          />
        </BrowserRouter>
      </ReduxWrapper>
  );

const makePackageFile = (reference: string, title: string): IPermitPackageFile => ({
  now_application_document_xref_guid: `xref-${reference}`,
  permit_package_document_type_code: reference.startsWith("Figure") ? "FIGURE" : "DOCUMENT",
  order_label: reference.split(" ").pop(),
  title,
  reference,
  label: `${reference}, ${title}`,
  mine_document: {
    mine_document_guid: `mine-doc-${reference}`,
    document_manager_guid: `docman-${reference}`,
    document_name: "file.pdf",
  } as IPermitPackageFile["mine_document"],
});

describe("MinePermitTable", () => {
  it("renders properly", () => {
    const { container } = renderTable(MOCK.PERMITS);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("lists permit package files in the order received, shortening long labels with the full label on hover", () => {
    const longTitle = "Application Figure (Wildlife Management Plan) showing seasonal caribou migration corridors";
    const files = [
      makePackageFile("Figure 1", "Site Plan"),
      makePackageFile("Figure 2", longTitle),
      makePackageFile("Permit Document 1.2", "Water Plan"),
    ];
    const [permit] = MOCK.PERMITS;
    const permits = [
      {
        ...permit,
        permit_amendments: permit.permit_amendments.map((amendment, index) => ({
          ...amendment,
          permit_package_files: index === 0 ? files : [],
        })),
      },
    ];

    renderTable(permits, [permit.permit_guid]);

    const items = screen.getAllByTitle(/^(Figure|Permit Document) /);
    expect(items.map((item) => item.textContent.trim())).toEqual([
      "Figure 1, Site Plan",
      "Figure 2, Application Figure (Wildlife M[...]",
      "Permit Document 1.2, Water Plan",
    ]);
    expect(items[1].getAttribute("title")).toBe(`Figure 2, ${longTitle}`);
  });
});
