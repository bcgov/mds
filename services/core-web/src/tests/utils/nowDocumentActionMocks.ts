import * as noticeOfWorkActionCreator from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import * as modalActions from "@mds/common/redux/actions/modalActions";
import * as documentViewer from "@mds/common/components/syncfusion/DocumentViewer";

// The NoW document tables dispatch their actions themselves, so tests spy on the action creators.
// Each spy hands the call to one of these mocks, which tests can assert on or give a resolved value.
export const actionMocks = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  updateNoticeOfWorkApplication: jest.fn(),
  fetchImportedNoticeOfWorkApplication: jest.fn(),
  deleteNoticeOfWorkApplicationDocument: jest.fn().mockResolvedValue(undefined),
  editNoticeOfWorkDocument: jest.fn(),
  sortNoticeOfWorkDocuments: jest.fn(),
  createNoticeOfWorkApplicationImportSubmissionDocumentsJob: jest.fn(),
  fetchImportNoticeOfWorkSubmissionDocumentsJob: jest.fn(),
  createNoticeOfWorkDocumentVersion: jest.fn(),
  archiveNoticeOfWorkDocuments: jest.fn(),
  openDocument: jest.fn(),
};

const thunkNames = [
  "updateNoticeOfWorkApplication",
  "fetchImportedNoticeOfWorkApplication",
  "deleteNoticeOfWorkApplicationDocument",
  "editNoticeOfWorkDocument",
  "sortNoticeOfWorkDocuments",
  "createNoticeOfWorkApplicationImportSubmissionDocumentsJob",
  "fetchImportNoticeOfWorkSubmissionDocumentsJob",
  "createNoticeOfWorkDocumentVersion",
  "archiveNoticeOfWorkDocuments",
] as const;

export const installActionSpies = () => {
  thunkNames.forEach((name) => {
    jest
      .spyOn(noticeOfWorkActionCreator, name as any)
      .mockImplementation(((...args) => () => actionMocks[name](...args)) as any);
  });
  jest
    .spyOn(documentViewer, "openDocument")
    .mockImplementation(((...args) => () => actionMocks.openDocument(...args)) as any);
  jest.spyOn(modalActions, "openModal").mockImplementation(((...args) => {
    actionMocks.openModal(...args);
    return { type: "MOCK_OPEN_MODAL" };
  }) as any);
  jest.spyOn(modalActions, "closeModal").mockImplementation((() => {
    actionMocks.closeModal();
    return { type: "MOCK_CLOSE_MODAL" };
  }) as any);
};
