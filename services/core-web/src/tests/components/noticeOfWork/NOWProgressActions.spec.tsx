import React from "react";
import { render } from "@testing-library/react";
import { NOWProgressActions } from "@/components/noticeOfWork/NOWProgressActions";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const reducerProps = {
  applicationDelay: {},
  progress: {},
  progressStatusHash: {},
  tab: "application",
  noticeOfWork: { notice_of_work_type_code: "PLA", application_type_code: "NOW" },
  delayTypeOptions: [],
  draftPermitAmendment: {},
  isNoticeOfWorkTypeDisabled: false,
};
const dispatchProps = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  createNoticeOfWorkApplicationProgress: jest.fn(),
  updateNoticeOfWorkApplicationProgress: jest.fn(),
  fetchImportedNoticeOfWorkApplication: jest.fn(),
  updateApplicationDelay: jest.fn(),
  createApplicationDelay: jest.fn(),
  fetchApplicationDelay: jest.fn(),
  handleDraftPermit: jest.fn(),
};

describe("NOWProgressActions", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><NOWProgressActions {...reducerProps} {...dispatchProps} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
