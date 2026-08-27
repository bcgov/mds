import React from "react";
import { render } from "@testing-library/react";
import { ManageDocumentsTab } from "@/components/noticeOfWork/applications/manageDocuments/ManageDocumentsTab";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const dispatchProps = {
  updateNoticeOfWorkApplication: jest.fn(),
  fetchImportedNoticeOfWorkApplication: jest.fn(),
  fetchNoticeOfWorkApplicationReviews: jest.fn(),
};
// Covers the System-generated Documents filter's AEF/PMT/PMA/DRAFT branches: a non-permit AEF
// doc (included), a draft PMT (included via the DRAFT name check), and a final PMA (excluded).
const SYSTEM_GENERATED_DOCUMENTS_TEST_DOCS = [
  {
    now_application_document_xref_guid: "aef-ntr",
    now_application_document_sub_type_code: "AEF",
    now_application_document_type_code: "NTR",
    mine_document: {
      mine_document_guid: "aef-ntr-guid",
      document_name: "notice_of_work_form.pdf",
    },
  },
  {
    now_application_document_xref_guid: "aef-pmt-draft",
    now_application_document_sub_type_code: "AEF",
    now_application_document_type_code: "PMT",
    mine_document: {
      mine_document_guid: "aef-pmt-draft-guid",
      document_name: "DRAFT_permit.pdf",
    },
  },
  {
    now_application_document_xref_guid: "aef-pma-final",
    now_application_document_sub_type_code: "AEF",
    now_application_document_type_code: "PMA",
    mine_document: {
      mine_document_guid: "aef-pma-final-guid",
      document_name: "final_permit.pdf",
    },
  },
];

const reducerProps = {
  noticeOfWork: {
    ...NOW_MOCK.NOTICE_OF_WORK,
    application_type_code: "NOW",
    documents: SYSTEM_GENERATED_DOCUMENTS_TEST_DOCS,
  },
  inspectors: [],
  importNowSubmissionDocumentsJob: false,
  fixedTop: false,
  formValues: NOW_MOCK.NOTICE_OF_WORK,
  noticeOfWorkReviews: [],
};

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
}

describe("ManageDocumentsTab", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper initialState={initialState}><BrowserRouter><ManageDocumentsTab {...dispatchProps} {...reducerProps} /></BrowserRouter></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
