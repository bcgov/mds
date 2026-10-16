import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import * as documentActionCreator from "@mds/common/redux/actionCreators/documentActionCreator";
import {
  NOWDownloadAllButton,
  toDownloadAllDocuments,
} from "@/components/noticeOfWork/applications/NOWDownloadAllButton";

const MINE_GUID = "mine-guid";

const importedRow = {
  mine_document_guid: "imported-mine-doc",
  document_manager_guid: "imported-doc-manager",
  filename: "application.pdf",
};
// A vFCBC file that hasn't been imported into Document Manager yet
const notImportedRow = { filename: "not-imported.pdf" };

describe("NOWDownloadAllButton", () => {
  describe("toDownloadAllDocuments", () => {
    it("includes every file in Document Manager, for this mine", () => {
      const [document] = toDownloadAllDocuments([importedRow], MINE_GUID);

      expect(document).toMatchObject({
        mine_document_guid: "imported-mine-doc",
        document_manager_guid: "imported-doc-manager",
        document_name: "application.pdf",
        mine_guid: MINE_GUID,
        is_latest_version: true,
      });
    });

    it("skips files that aren't in Document Manager yet, and previous versions", () => {
      const versionRow = { ...importedRow, mine_document_version_guid: "version-guid" };

      expect(toDownloadAllDocuments([notImportedRow, versionRow], MINE_GUID)).toEqual([]);
    });
  });

  it("warns that previous versions aren't included, then zips every file in the table", async () => {
    const compressionSpy = jest
      .spyOn(documentActionCreator, "documentsCompression")
      .mockReturnValue(() => Promise.resolve({ data: {} }));
    render(
      <ReduxWrapper>
        <NOWDownloadAllButton
          rows={[importedRow, notImportedRow]}
          mineGuid={MINE_GUID}
          documentType="application-documents"
        />
      </ReduxWrapper>
    );

    fireEvent.click(screen.getByRole("button", { name: /Download All/ }));

    expect(await screen.findByText(/previous versions will not be downloaded/)).toBeInTheDocument();
    expect(compressionSpy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(compressionSpy).toHaveBeenCalledWith(MINE_GUID, ["imported-doc-manager"]);
  });

  it("can't be used when the table has nothing to download", () => {
    render(
      <ReduxWrapper>
        <NOWDownloadAllButton
          rows={[notImportedRow]}
          mineGuid={MINE_GUID}
          documentType="application-documents"
        />
      </ReduxWrapper>
    );

    expect(screen.getByRole("button", { name: /Download All/ })).toBeDisabled();
  });
});
