import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NOWProgressStatus } from "@/components/noticeOfWork/NOWProgressStatus";

// Common base props
const baseNoticeOfWork = {
  now_application_guid: "123-abc",
  notice_of_work_type_code: "PLA",
  application_type_code: "NOW",
};

const progressStatusHash = {
  REV: "Review",
  DFT: "Draft",
  ENG: "Engineering",
};

describe("NOWProgressStatus", () => {
  it("shows 'Not Started' when tab has no progress", () => {
    render(
      <MemoryRouter>
        <NOWProgressStatus
          progressStatusHash={progressStatusHash}
          showProgress
          progress={{}}
          tab="REV"
          noticeOfWork={baseNoticeOfWork}
          match={{ params: { id: 1 } }}
        />
      </MemoryRouter>
    );
    expect(screen.getByText(/Review Status:/i)).toBeInTheDocument();
    expect(screen.getByText(/Not Started/)).toBeInTheDocument();
  });

  it("shows 'In Progress' details when start_date present and no end_date", () => {
    const progress = {
      REV: { start_date: "2025-01-01", duration: "1 Day" },
    } as any;
    render(
      <MemoryRouter>
        <NOWProgressStatus
          progressStatusHash={progressStatusHash}
          showProgress
          progress={progress}
          tab="REV"
          noticeOfWork={baseNoticeOfWork}
          match={{ params: { id: 1 } }}
        />
      </MemoryRouter>
    );
    expect(screen.getByText(/In Progress/)).toBeInTheDocument();
    expect(screen.getByText(/In Review Since:/)).toBeInTheDocument();
    // Date formatted by formatDate helper (MMM DD YYYY)
    expect(screen.getByText(/Jan 01 2025/)).toBeInTheDocument();
  });

  it("shows 'Complete' details when end_date present", () => {
    const progress = {
      REV: { start_date: "2025-01-01", end_date: "2025-01-05", duration: "4 Days" },
    } as any;
    render(
      <MemoryRouter>
        <NOWProgressStatus
          progressStatusHash={progressStatusHash}
          showProgress
          progress={progress}
          tab="REV"
          noticeOfWork={baseNoticeOfWork}
          match={{ params: { id: 1 } }}
        />
      </MemoryRouter>
    );
    expect(screen.getByText(/Complete/)).toBeInTheDocument();
    expect(screen.getByText(/Started on:/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 01 2025/)).toBeInTheDocument();
  });

  it("renders last updated fields for REV tab", () => {
    render(
      <MemoryRouter>
        <NOWProgressStatus
          progressStatusHash={progressStatusHash}
          showProgress
          progress={{}}
          tab="REV"
          noticeOfWork={{ ...baseNoticeOfWork, last_updated_date: "2025-02-02", last_updated_by: "Test User" }}
          match={{ params: { id: 1 } }}
        />
      </MemoryRouter>
    );
    expect(screen.getByText(/Last Updated: Feb 02 2025/)).toBeInTheDocument();
    expect(screen.getByText(/Updated By: Test User/)).toBeInTheDocument();
  });

  it("does not show status when showProgress is false", () => {
    render(
      <MemoryRouter>
        <NOWProgressStatus
          progressStatusHash={progressStatusHash}
          showProgress={false}
          progress={{}}
          tab="REV"
          noticeOfWork={baseNoticeOfWork}
          match={{ params: { id: 1 } }}
        />
      </MemoryRouter>
    );
    expect(screen.queryByText(/Review Status:/i)).not.toBeInTheDocument();
  });
});
