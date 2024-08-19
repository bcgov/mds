import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
  queryByAttribute,
  screen,
} from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import DocumentTable from "./DocumentTable";
import { MineDocument } from "@mds/common/models/documents/document";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { FORM } from "@mds/common/constants";
import { openModal } from "@mds/common/redux/actions/modalActions";
import * as modalActions from "@mds/common/redux/actions/modalActions";

const documents = MOCK.PROJECT_SUMMARY.documents.map((d) => new MineDocument(d));

describe("DocumentTable", () => {
  const removeFunc = jest.fn();
  const onArchiveFunc = jest.fn();
  const onReplaceFunc = jest.fn();

  const openModalSpy = jest.spyOn(modalActions, "openModal");
  it("renders properly", async () => {
    const { container, getByText, getAllByText, findByText, findByTestId } = render(
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
    // fireEvent.click(actionsButton);
    const archiveAction = await findByTestId("action-button-archive"); //view, download, replace, download-all
    // const viewAction = await findByText(/Download file/i);
    fireEvent.click(archiveAction);
    expect(openModalSpy).toHaveBeenCalledTimes(1);
    // screen.debug();
    // await waitFor(() => expect(findByText(/about to archive the following file/)).toBeInTheDocument());
    // const archiveButton = await findByText(/Archive/);
    // fireEvent.click(archiveButton);
    // screen.debug()
    // await waitFor(() => { expect(queryByAttribute("id", container, "loading-screen")).toBeInTheDocument() })
    // // await waitFor(() => container.querySelector(`#${FORM.ARCHIVE_DOCUMENT}`).)
    // await waitForElementToBeRemoved(() => container.querySelector(`#loading-screen`))
    expect(onArchiveFunc).toHaveBeenCalledTimes(1);
  });
});
