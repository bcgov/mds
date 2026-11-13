import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { IMineDocument, IPermitPackageFile } from "@mds/common/interfaces";
import { downloadFileFromDocumentManager } from "@mds/common/redux/utils/actionlessNetworkCalls";
import { permitFileColumns } from "@/components/dashboard/mine/permits/permitFileColumns";

jest.mock("@mds/common/redux/utils/actionlessNetworkCalls", () => ({
  downloadFileFromDocumentManager: jest.fn(),
}));

const [packageColumn, filesColumn] = permitFileColumns;

const makeDocument = (document_name: string): IMineDocument =>
  ({
    mine_document_guid: `guid-${document_name}`,
    document_manager_guid: `docman-${document_name}`,
    document_name,
  }) as IMineDocument;

describe("permitFileColumns", () => {
  beforeEach(() => jest.clearAllMocks());

  it("lists the permit package files with their references", () => {
    const files: IPermitPackageFile[] = [
      {
        now_application_document_xref_guid: "xref-1",
        permit_package_document_type_code: "FIGURE",
        order_label: "1",
        title: "Site Plan",
        reference: "Figure 1",
        label: "Figure 1, Site Plan",
        mine_document: makeDocument("site-plan.pdf"),
      },
    ];

    render(<>{packageColumn.render(files as any)}</>);

    expect(screen.getByRole("link", { name: "Figure 1, Site Plan" })).toBeTruthy();
  });

  it("lists the permit files and opens one when clicked", () => {
    const file = makeDocument("permit.pdf");

    render(<>{filesColumn.render([file] as any)}</>);
    fireEvent.click(screen.getByRole("link", { name: "permit.pdf" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(downloadFileFromDocumentManager).toHaveBeenCalledWith(file);
  });

  it("shows an empty field when there are no permit files", () => {
    const { container } = render(<>{filesColumn.render([] as any)}</>);

    expect(container.textContent).toBe("-");
    expect(screen.queryByRole("link")).toBeNull();
  });
});
