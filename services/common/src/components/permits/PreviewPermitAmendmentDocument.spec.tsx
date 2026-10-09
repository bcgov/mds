import React from "react";
import { render, waitFor } from "@testing-library/react";
import { PreviewPermitAmendmentDocument } from "@mds/common/components/permits/PreviewPermitAmendmentDocument";
import { PdfViewer } from "@mds/common/components/syncfusion/DocumentViewer";
import { getDocument } from "@mds/common/redux/utils/actionlessNetworkCalls";
import { IPermitAmendment } from "@mds/common/interfaces/permits";

jest.mock("@mds/common/redux/utils/actionlessNetworkCalls", () => ({
  getDocument: jest.fn(),
}));

jest.mock("@mds/common/components/syncfusion/DocumentViewer", () => ({
  PdfViewer: jest.fn(() => null),
}));

const amendment = ({
  related_documents: [
    {
      permit_amendment_document_guid: "permit-amendment-document-guid",
      document_manager_guid: "doc-manager-guid",
      document_name: "permit.pdf",
    },
  ],
} as unknown) as IPermitAmendment;

describe("PreviewPermitAmendmentDocument", () => {
  it("passes the permit document's name to the viewer, so it downloads with the right file name", async () => {
    (getDocument as jest.Mock).mockResolvedValue({ object_store_path: "mock/object/store/path" });

    render(
      <PreviewPermitAmendmentDocument
        amendment={amendment}
        documentGuid="permit-amendment-document-guid"
      />
    );

    await waitFor(() =>
      expect(PdfViewer).toHaveBeenCalledWith(
        expect.objectContaining({
          documentPath: "mock/object/store/path",
          downloadFileName: "permit.pdf",
        }),
        expect.anything()
      )
    );
    expect(getDocument).toHaveBeenCalledWith("doc-manager-guid");
  });
});
