import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { IMineDocument, IPermitPackageFile } from "@mds/common/interfaces";
import { downloadFileFromDocumentManager } from "@mds/common/redux/utils/actionlessNetworkCalls";
import { PermitPackageFiles } from "@/components/dashboard/mine/permits/PermitPackageFiles";

jest.mock("@mds/common/redux/utils/actionlessNetworkCalls", () => ({
  downloadFileFromDocumentManager: jest.fn(),
}));

const makeFile = (
  reference: string,
  title: string,
  overrides: Partial<IPermitPackageFile> = {}
): IPermitPackageFile => ({
  now_application_document_xref_guid: `xref-${reference}`,
  permit_package_document_type_code: reference.startsWith("Figure") ? "FIGURE" : "DOCUMENT",
  order_label: reference.split(" ").pop(),
  title,
  reference,
  label: `${reference}, ${title}`,
  mine_document: {
    mine_document_guid: "mine-doc-guid",
    document_manager_guid: "docman-guid",
    document_name: "file.pdf",
  } as IMineDocument,
  ...overrides,
});

describe("PermitPackageFiles", () => {
  beforeEach(() => jest.clearAllMocks());

  it("lists each file's reference in the order received", () => {
    const files = [
      makeFile("Figure 1", "Site Plan"),
      makeFile("Permit Document 1.1", "Notice of Work Application"),
      makeFile("Permit Document 1.2", "Water Plan"),
    ];

    render(<PermitPackageFiles files={files} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Figure 1, Site Plan",
      "Permit Document 1.1, Notice of Work Appl[...]",
      "Permit Document 1.2, Water Plan",
    ]);
  });

  it("shortens a long label but keeps the reference, with the full label on hover", () => {
    const file = makeFile(
      "Figure 2",
      "Application Figure (Wildlife Management Plan) showing seasonal caribou migration corridors"
    );

    render(<PermitPackageFiles files={[file]} />);

    const link = screen.getByRole("link");
    expect(link.textContent).toBe("Figure 2, Application Figure (Wildlife M[...]");
    expect(link.getAttribute("title")).toBe(file.label);
  });

  it("opens the file's document when its reference is clicked", () => {
    const file = makeFile("Figure 1", "Site Plan");

    render(<PermitPackageFiles files={[file]} />);
    fireEvent.click(screen.getByRole("link", { name: "Figure 1, Site Plan" }));

    expect(downloadFileFromDocumentManager).toHaveBeenCalledWith(file.mine_document);
  });

  it("shows an empty field when there are no files", () => {
    const { container } = render(<PermitPackageFiles files={[]} />);

    expect(container.textContent).toBe("-");
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("shows the reference as plain text when the file has no document to open", () => {
    render(<PermitPackageFiles files={[makeFile("Figure 2", "Map", { mine_document: null })]} />);

    expect(screen.getByText("Figure 2, Map")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
