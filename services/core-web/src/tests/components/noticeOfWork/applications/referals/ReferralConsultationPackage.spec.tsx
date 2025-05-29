import React from "react";
import { render } from "@testing-library/react";
import { ReferralConsultationPackage } from "@/components/noticeOfWork/applications/referals/ReferralConsultationPackage";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";

const dispatchProps = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  setNoticeOfWorkApplicationDocumentDownloadState: jest.fn(),
  updateNoticeOfWorkApplication: jest.fn(),
  fetchImportedNoticeOfWorkApplication: jest.fn(),
};
const reducerProps = {
  noticeOfWork: NOW_MOCK.NOTICE_OF_WORK,
  importNowSubmissionDocumentsJob: {},
  progress: "REV",
  type: "REF",
  isTableHeaderView: false,
};

describe("ReferralConsultationPackage", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReferralConsultationPackage {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
