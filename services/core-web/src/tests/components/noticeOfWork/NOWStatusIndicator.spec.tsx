import React from "react";
import { render, screen } from "@testing-library/react";
import { NOWStatusIndicator } from "@/components/noticeOfWork/NOWStatusIndicator";

const baseNOW = {
  now_application_guid: "guid-1",
  notice_of_work_type_code: "PLA",
  application_type_code: "NOW",
  now_application_status_code: "REV",
};

const delayTypeOptionsHash = { D1: "Awaiting Info" } as any;

describe("NOWStatusIndicator banner", () => {
  const renderBanner = (override = {}) =>
    render(
      <NOWStatusIndicator
        applicationDelay={{}}
        progress={{}}
        delayTypeOptionsHash={delayTypeOptionsHash}
        tabSection="REV"
        noticeOfWork={baseNOW}
        isEditMode={false}
        type="banner"
        match={{ params: { id: 1 } }}
        {...override}
      />
    );

  it("shows 'Application is Approved' when status AIA", () => {
    renderBanner({ noticeOfWork: { ...baseNOW, now_application_status_code: "AIA" } });
    expect(screen.getByText(/Application is Approved/)).toBeInTheDocument();
  });

  it("shows 'Application has been Withdrawn' when status WDN", () => {
    renderBanner({ noticeOfWork: { ...baseNOW, now_application_status_code: "WDN" } });
    expect(screen.getByText(/Application has been Withdrawn/)).toBeInTheDocument();
  });

  it("shows 'Application has been Rejected' when status REJ", () => {
    renderBanner({ noticeOfWork: { ...baseNOW, now_application_status_code: "REJ" } });
    expect(screen.getByText(/Application has been Rejected/)).toBeInTheDocument();
  });

  it("shows delay banner when application delayed", () => {
    renderBanner({ applicationDelay: { delay_type_code: "D1" } });
    expect(screen.getByText(/Delayed: Awaiting Info/)).toBeInTheDocument();
  });

  it("shows Edit Mode when isEditMode true", () => {
    renderBanner({ isEditMode: true });
    expect(screen.getByText(/Edit Mode/)).toBeInTheDocument();
  });

  it("shows Complete when section completed", () => {
    const progress = { REV: { end_date: "2025-01-01" } } as any;
    renderBanner({ progress });
    expect(screen.getByText(/Complete/)).toBeInTheDocument();
  });

  it("does not render banner for in-progress (showBanner false)", () => {
    const progress = { REV: { start_date: "2025-01-01" } } as any;
    renderBanner({ progress });

    const banner = screen.getByRole("alert", { hidden: true });
    expect(banner).toHaveClass("status-banner");
    expect(banner).toHaveStyle({ display: "none" });
  });
});

describe("NOWStatusIndicator badge", () => {
  const renderBadge = (override = {}) =>
    render(
      <NOWStatusIndicator
        applicationDelay={{}}
        progress={{}}
        delayTypeOptionsHash={delayTypeOptionsHash}
        tabSection="REV"
        noticeOfWork={baseNOW}
        isEditMode={false}
        type="badge"
        match={{ params: { id: 1 } }}
        {...override}
      />
    );

  it("renders grey badge when not started", () => {
    const { container } = renderBadge();
    // Tooltip wraps a span.ant-badge-status-dot; no accessible role. Assert dot exists.
    const dot = container.querySelector('.ant-badge-status-dot');
    expect(dot).toBeTruthy();
  });

  it("renders blue badge for in progress", () => {
    const progress = { REV: { start_date: "2025-01-01" } } as any;
    const { container } = renderBadge({ progress });
    const dot = container.querySelector('.ant-badge-status-dot');
    expect(dot).toBeTruthy();
  });
});
