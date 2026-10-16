import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { PermitPackage } from "@/components/noticeOfWork/applications/PermitPackage";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";
import * as documentActionCreator from "@mds/common/redux/actionCreators/documentActionCreator";

const dispatchProps = {
  change: jest.fn(),
  updateNoticeOfWorkApplication: jest.fn(),
  fetchImportedNoticeOfWorkApplication: jest.fn(),
  closeModal: jest.fn(),
  openModal: jest.fn(),
  setNoticeOfWorkApplicationDocumentDownloadState: jest.fn(),
};
const props = {
  noticeOfWork: NOWMocks.IMPORTED_NOTICE_OF_WORK,
  isAdminView: true,
  isTableHeaderView: true,
  importNowSubmissionDocumentsJob: {},
};

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: NOWMocks.IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
};
describe("PermitPackage", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper initialState={initialState}><PermitPackage {...props} {...dispatchProps} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });

  describe("Download All", () => {
    const noticeOfWork = {
      ...NOWMocks.IMPORTED_NOTICE_OF_WORK,
      filtered_submission_documents: [],
      documents: [
        {
          now_application_document_xref_guid: "package-xref",
          is_final_package: true,
          mine_document: {
            mine_document_guid: "package-mine-doc",
            document_manager_guid: "package-doc-manager",
            document_name: "package.pdf",
          },
        },
      ],
    };

    const clickDownloadAll = (showDownloadWarning?: boolean) => {
      render(
        <BrowserRouter>
          <ReduxWrapper initialState={initialState}>
            <PermitPackage
              {...props}
              {...dispatchProps}
              noticeOfWork={noticeOfWork}
              isTableHeaderView={false}
              showDownloadWarning={showDownloadWarning}
            />
          </ReduxWrapper>
        </BrowserRouter>
      );
      fireEvent.click(screen.getByRole("button", { name: /Download All/ }));
    };

    let compressionSpy: jest.SpyInstance;
    beforeEach(() => {
      compressionSpy = jest
        .spyOn(documentActionCreator, "documentsCompression")
        .mockReturnValue(() => Promise.resolve({ data: {} }));
    });

    afterEach(() => {
      compressionSpy.mockRestore();
    });

    it("warns that previous versions aren't included when showDownloadWarning is set", async () => {
      clickDownloadAll(true);

      expect(await screen.findByText(/previous versions will not be downloaded/)).toBeInTheDocument();
      expect(compressionSpy).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "Continue" }));

      expect(compressionSpy).toHaveBeenCalledWith(noticeOfWork.mine_guid, ["package-doc-manager"]);
    });

    it("downloads straight away by default, as before", () => {
      clickDownloadAll();

      expect(screen.queryByText(/previous versions will not be downloaded/)).not.toBeInTheDocument();
      expect(compressionSpy).toHaveBeenCalledWith(noticeOfWork.mine_guid, ["package-doc-manager"]);
    });
  });
});
