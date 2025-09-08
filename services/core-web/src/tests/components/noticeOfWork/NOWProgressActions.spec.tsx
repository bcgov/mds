import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { NOWProgressActions } from "@/components/noticeOfWork/NOWProgressActions";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { USER_ROLES } from "@mds/common/constants/environment";

// NOTE: AuthorizationWrapper maps permission constants (e.g. role_edit_permits)
// through USER_ROLES to their concrete role string (e.g. core_edit_permits).
// The redux authentication slice stores those concrete role strings in
// userAccessData. Previous test state used the wrong slice key/name and
// an unmapped value so the buttons never rendered.

// Helper to render with store
const defaultState = {
  AUTHENTICATION: {
    isAuthenticated: true,
    userAccessData: [USER_ROLES.role_edit_permits], // mapped value: core_edit_permits
  },
};

const renderWithStore = (ui, initialState = {}) =>
  render(<ReduxWrapper initialState={{ ...defaultState, ...initialState }}>{ui}</ReduxWrapper>);

const baseNoticeOfWork = {
  now_application_guid: "now-123",
  notice_of_work_type_code: "PLA",
  application_type_code: "NOW",
  now_application_status_code: "REV",
};

const progressStatusHash = { REV: "Review", DFT: "Draft" };

const makeDispatchProps = () => ({
  openModal: jest.fn(),
  closeModal: jest.fn(),
  createNoticeOfWorkApplicationProgress: jest.fn().mockResolvedValue({}),
  updateNoticeOfWorkApplicationProgress: jest.fn().mockResolvedValue({}),
  fetchImportedNoticeOfWorkApplication: jest.fn().mockResolvedValue({}),
  updateApplicationDelay: jest.fn().mockResolvedValue({}),
  createApplicationDelay: jest.fn().mockResolvedValue({}),
  fetchApplicationDelay: jest.fn().mockResolvedValue({}),
  handleDraftPermit: jest.fn(),
});

describe("NOWProgressActions", () => {
  it("renders start button when no progress", () => {
    const dispatchProps = makeDispatchProps();
    renderWithStore(
      <NOWProgressActions
        applicationDelay={{}}
        progress={{}}
        progressStatusHash={progressStatusHash}
        tab="REV"
        noticeOfWork={baseNoticeOfWork}
        delayTypeOptions={[]}
        draftPermitAmendment={{}}
        isNoticeOfWorkTypeDisabled={false}
        {...dispatchProps}
      />
    );
    expect(screen.getByText(/Start Review/)).toBeInTheDocument();
  });

  it("shows Complete button when in progress", () => {
    const dispatchProps = makeDispatchProps();
    const progress = { REV: { start_date: "2025-01-01" } } as any;
    renderWithStore(
      <NOWProgressActions
        applicationDelay={{}}
        progress={progress}
        progressStatusHash={progressStatusHash}
        tab="REV"
        noticeOfWork={baseNoticeOfWork}
        delayTypeOptions={[]}
        draftPermitAmendment={{}}
        isNoticeOfWorkTypeDisabled={false}
        {...dispatchProps}
      />
    );
    expect(screen.getByText(/Complete Review/)).toBeInTheDocument();
  });

  it("shows Resume button when complete", () => {
    const dispatchProps = makeDispatchProps();
    const progress = { REV: { start_date: "2025-01-01", end_date: "2025-01-02" } } as any;
    renderWithStore(
      <NOWProgressActions
        applicationDelay={{}}
        progress={progress}
        progressStatusHash={progressStatusHash}
        tab="REV"
        noticeOfWork={baseNoticeOfWork}
        delayTypeOptions={[]}
        draftPermitAmendment={{}}
        isNoticeOfWorkTypeDisabled={false}
        {...dispatchProps}
      />
    );
    expect(screen.getByText(/Resume Review/)).toBeInTheDocument();
  });

  it("opens progress modal on Start click", () => {
    const dispatchProps = makeDispatchProps();
    renderWithStore(
      <NOWProgressActions
        applicationDelay={{}}
        progress={{}}
        progressStatusHash={progressStatusHash}
        tab="REV"
        noticeOfWork={baseNoticeOfWork}
        delayTypeOptions={[]}
        draftPermitAmendment={{}}
        isNoticeOfWorkTypeDisabled={false}
        {...dispatchProps}
      />
    );
    fireEvent.click(screen.getByText(/Start Review/));
    expect(dispatchProps.openModal).toHaveBeenCalledWith(
      expect.objectContaining({ props: expect.objectContaining({ trigger: "Start" }) })
    );
  });

  it("shows delay reason button when application delayed", () => {
    const dispatchProps = makeDispatchProps();
    renderWithStore(
      <NOWProgressActions
        applicationDelay={{ start_date: "2025-01-01", delay_type_code: "D1" }}
        progress={{}}
        progressStatusHash={progressStatusHash}
        tab="REV"
        noticeOfWork={baseNoticeOfWork}
        delayTypeOptions={[]}
        draftPermitAmendment={{}}
        isNoticeOfWorkTypeDisabled={false}
        {...dispatchProps}
      />
    );
    expect(screen.getByText(/View Reason for Delay/)).toBeInTheDocument();
  });

  it("hides action buttons when processed (AIA)", () => {
    const dispatchProps = makeDispatchProps();
    renderWithStore(
      <NOWProgressActions
        applicationDelay={{}}
        progress={{}}
        progressStatusHash={progressStatusHash}
        tab="REV"
        noticeOfWork={{ ...baseNoticeOfWork, now_application_status_code: "AIA" }}
        delayTypeOptions={[]}
        draftPermitAmendment={{}}
        isNoticeOfWorkTypeDisabled={false}
        {...dispatchProps}
      />
    );
    expect(screen.queryByText(/Start Review/)).not.toBeInTheDocument();
    // Still can view status reason because processedWithReason for AIA? (AIA not in processedWithReason list) so may not show
  });

  it("shows create draft button when DFT tab in progress but draft permit deleted", () => {
    const dispatchProps = makeDispatchProps();
    const progress = { DFT: { start_date: "2025-01-01" } } as any; // no end date, in progress
    renderWithStore(
      <NOWProgressActions
        applicationDelay={{}}
        progress={progress}
        progressStatusHash={progressStatusHash}
        tab="DFT"
        noticeOfWork={baseNoticeOfWork}
        delayTypeOptions={[]}
        draftPermitAmendment={{}} // empty so triggers isDeletedDraftPermitInProgress
        isNoticeOfWorkTypeDisabled={false}
        {...dispatchProps}
      />
    );
    expect(screen.getByText(/Create Draft/)).toBeInTheDocument();
  });
});
