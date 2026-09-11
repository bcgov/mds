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
});
