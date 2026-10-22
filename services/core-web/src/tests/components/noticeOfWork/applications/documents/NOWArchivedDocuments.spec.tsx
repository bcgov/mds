import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { FileOperations } from "@mds/common/models/documents/document";
import * as Strings from "@mds/common/constants/strings";
import * as DocumentViewer from "@mds/common/components/syncfusion/DocumentViewer";
import {
  NOWArchivedDocuments,
  toArchivedDocuments,
} from "@/components/noticeOfWork/applications/manageDocuments/NOWArchivedDocuments";

// A Government Document added in Core, archived after being replaced once
const archivedCoreDocument = {
  now_application_document_xref_guid: "core-xref",
  now_application_document_type_code: "CAL",
  now_application_document_sub_type_code: "GDO",
  mine_document: {
    mine_document_guid: "core-mine-doc",
    document_manager_guid: "core-doc-manager",
    document_name: "letter-v2.pdf",
    is_archived: true,
    versions: [
      {
        mine_document_version_guid: "core-version",
        document_manager_version_guid: "core-doc-manager-version",
        document_name: "letter-v1.pdf",
      },
    ],
  },
};

// A vFCBC file, replaced then archived, so its current name differs from its original filename
const archivedSubmissionDocument = {
  mine_document_guid: "vfcbc-mine-doc",
  document_manager_guid: "vfcbc-doc-manager",
  filename: "original.pdf",
  document_name: "replaced.pdf",
  documenttype: "Application Form",
  is_archived: true,
};

const noticeOfWork = {
  ...NOWMocks.IMPORTED_NOTICE_OF_WORK,
  archived_documents: [archivedCoreDocument],
  archived_submission_documents: [archivedSubmissionDocument],
};

const documentTypeOptionsHash = { CAL: "Acknowledgement Letter" };

describe("NOWArchivedDocuments", () => {
  describe("toArchivedDocuments", () => {
    it("shows the document category a file was archived from", () => {
      const [core, submission] = toArchivedDocuments(noticeOfWork, documentTypeOptionsHash);

      expect(core.category).toBe("Acknowledgement Letter");
      expect(submission.category).toBe("Application Form");
    });

    it("shows a replaced vFCBC file's current name", () => {
      const [, submission] = toArchivedDocuments(noticeOfWork, documentTypeOptionsHash);

      expect(submission.document_name).toBe("replaced.pdf");
    });

    it("only lets archived files, and their previous versions, be viewed and downloaded", () => {
      const [core, submission] = toArchivedDocuments(noticeOfWork, documentTypeOptionsHash);

      [core, core.versions[0], submission].forEach((document) =>
        expect(document.allowed_actions.filter(Boolean)).toEqual([
          FileOperations.View,
          FileOperations.Download,
        ])
      );
    });

    it("doesn't crash when an archived file comes back without its mine document", () => {
      const [core] = toArchivedDocuments(
        { ...noticeOfWork, archived_documents: [{ ...archivedCoreDocument, mine_document: undefined }] },
        documentTypeOptionsHash
      );

      expect(core.document_name).toBe(Strings.EMPTY_FIELD);
    });

    it("has nothing to show when no files have been archived", () => {
      expect(toArchivedDocuments(NOWMocks.IMPORTED_NOTICE_OF_WORK, documentTypeOptionsHash)).toEqual(
        []
      );
    });
  });

  it("opens the selected previous version in the document viewer", async () => {
    const openDocumentSpy = jest
      .spyOn(DocumentViewer, "openDocument")
      .mockReturnValue(() => Promise.resolve());
    const { container } = render(
      <ReduxWrapper>
        <NOWArchivedDocuments noticeOfWork={noticeOfWork} />
      </ReduxWrapper>
    );

    expect(screen.getByText("Acknowledgement Letter")).toBeInTheDocument();
    expect(screen.getByText("replaced.pdf")).toBeInTheDocument();

    fireEvent.click(container.querySelector(".expand-row-icon"));
    const versionRow = screen.getByText("letter-v1.pdf").closest("tr");
    fireEvent.mouseEnter(versionRow.querySelector(".actions-dropdown-button"));
    fireEvent.click(await screen.findByTestId("action-button-view"));

    expect(openDocumentSpy).toHaveBeenCalledWith(
      "core-doc-manager",
      "letter-v1.pdf",
      null,
      "core-doc-manager-version"
    );
  });
});
