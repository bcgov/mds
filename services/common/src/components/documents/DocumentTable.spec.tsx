import React from "react";
import { render, fireEvent } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import DocumentTable from "./DocumentTable";
import { MineDocument } from "@mds/common/models/documents/document";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as modalActions from "@mds/common/redux/actions/modalActions";

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
});
