import React from "react";
import { render, fireEvent } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import DocumentTable from "./DocumentTable";
import { MineDocument } from "@mds/common/models/documents/document";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as modalActions from "@mds/common/redux/actions/modalActions";
import * as DocumentViewer from "@mds/common/components/syncfusion/DocumentViewer";

const documents = MOCK.PROJECT_SUMMARY.documents.map((d) => new MineDocument(d));

describe("DocumentTable", () => {
  const removeFunc = jest.fn();
  const onArchiveFunc = jest.fn();
  const onReplaceFunc = jest.fn();

  const openModalSpy = jest.spyOn(modalActions, "openModal");
  it("renders properly", async () => {
    const { container, getAllByText, findByTestId } = render(
      <ReduxWrapper>
        <DocumentTable
          documents={documents}
          showVersionHistory
          canArchiveDocuments
          removeDocument={removeFunc}
          onArchivedDocuments={onArchiveFunc}
          onReplaceDocument={onReplaceFunc}
        />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
    const actionsButton = getAllByText("Actions")[0];
    fireEvent.mouseEnter(actionsButton);
    const archiveAction = await findByTestId("action-button-archive");
    fireEvent.click(archiveAction);
    expect(openModalSpy).toHaveBeenCalledTimes(1);
  });

  it("calls onReplaceDocument when replace is submitted", async () => {
    openModalSpy.mockClear();
    onReplaceFunc.mockClear();

    const { getAllByText, findByTestId } = render(
      <ReduxWrapper>
        <DocumentTable
          documents={documents}
          showVersionHistory
          canReplaceDocuments
          onReplaceDocument={onReplaceFunc}
        />
      </ReduxWrapper>
    );
    const actionsButton = getAllByText("Actions")[0];
    fireEvent.mouseEnter(actionsButton);
    const replaceAction = await findByTestId("action-button-replace");
    fireEvent.click(replaceAction);
    expect(openModalSpy).toHaveBeenCalledTimes(1);

    const modalProps = openModalSpy.mock.calls[0][0].props;
    const replacementDoc = new MineDocument({
      ...documents[0],
      document_name: "Marshmallow.docx",
    });
    await modalProps.handleSubmit(replacementDoc);
    expect(onReplaceFunc).toHaveBeenCalledWith(replacementDoc);
  });

  describe("opening a previous version in the document viewer", () => {
    const openDocumentSpy = jest
      .spyOn(DocumentViewer, "openDocument")
      .mockReturnValue(() => Promise.resolve());

    const replacedDocument = new MineDocument({
      mine_document_guid: "mine-doc-guid",
      document_manager_guid: "doc-manager-guid",
      document_name: "current.pdf",
      versions: [
        {
          mine_document_version_guid: "version-guid",
          document_manager_version_guid: "doc-manager-version-guid",
          document_name: "previous.pdf",
        },
      ],
    });

    const viewFromActions = async (openSelectedVersion: boolean, rowIndex: number) => {
      const { container, getAllByText, findByTestId } = render(
        <ReduxWrapper>
          <DocumentTable
            documents={[replacedDocument]}
            showVersionHistory
            canReplaceDocuments={false}
            openSelectedVersion={openSelectedVersion}
          />
        </ReduxWrapper>
      );
      fireEvent.click(container.querySelector(".expand-row-icon"));
      fireEvent.mouseEnter(getAllByText("Actions")[rowIndex]);
      fireEvent.click(await findByTestId("action-button-view"));
    };

    beforeEach(() => {
      openDocumentSpy.mockClear();
    });

    it("opens the selected version when openSelectedVersion is set", async () => {
      await viewFromActions(true, 1);

      expect(openDocumentSpy).toHaveBeenCalledWith(
        "doc-manager-guid",
        "previous.pdf",
        null,
        "doc-manager-version-guid"
      );
    });

    it("still opens the latest file from the current row when openSelectedVersion is set", async () => {
      await viewFromActions(true, 0);

      expect(openDocumentSpy).toHaveBeenCalledWith("doc-manager-guid", "current.pdf", null, null);
    });

    it("opens the latest file by default, as Major Projects does", async () => {
      await viewFromActions(false, 1);

      expect(openDocumentSpy).toHaveBeenCalledWith("doc-manager-guid", "previous.pdf", null, null);
    });
  });
});
