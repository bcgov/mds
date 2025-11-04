import React from "react";
import { getMineDashboardRoutes } from "@/components/dashboard/mine/MineDashboardRoutes";
import { Badge } from "antd";
import { MemoryRouter } from "react-router-dom";
import SidebarWrapper, { SidebarNavigation } from "@mds/common/components/common/SidebarWrapper";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const getRouteByKey = (routes: any[], key: string) => routes.find((r) => r && r.key === key);

describe("MineDashboardRoutes", () => {
  it("includes Applications when showApplications is true", () => {
    const routes = getMineDashboardRoutes(true, 0);
    const applications = getRouteByKey(routes, "applications");
    expect(applications).toBeTruthy();
    expect(applications.label).toBe("Applications");
  });

  it("omits Applications when showApplications is false", () => {
    const routes = getMineDashboardRoutes(false, 0);
    const applications = getRouteByKey(routes, "applications");
    expect(applications).toBeUndefined();
  });

  it("wraps Reports icon in a red Badge with the overdue count", () => {
    const overdueCount = 7;
    const routes = getMineDashboardRoutes(true, overdueCount);
    const reports = getRouteByKey(routes, "reports");
    expect(reports).toBeTruthy();

    const iconEl = reports.icon as React.ReactElement;
    expect(iconEl.type).toBe(Badge);

    expect(iconEl.props.count).toBe(overdueCount);
  });

  it("does not force-show zero; count undefined when not provided", () => {
    const routes = getMineDashboardRoutes(true);
    const reports = getRouteByKey(routes, "reports");
    const iconEl = reports.icon as React.ReactElement;

    expect(iconEl.props.count).toBeUndefined();
    expect(iconEl.props.showZero).toBe(false);
  });

  it("matches snapshot when navigated to the reports route", () => {
    const overdueCount = 12;
    const routes = getMineDashboardRoutes(true, overdueCount);
    const items = routes.map((item: any) => ({ ...item, path: `/${item.key}` }));

    const { container } = render(
      <ReduxWrapper>
        <MemoryRouter initialEntries={["/reports"]}>
          <SidebarWrapper items={items} pageContent={<div />}>
            <SidebarNavigation items={items} selectedKeys={["reports"]} />
          </SidebarWrapper>
        </MemoryRouter>
      </ReduxWrapper>
    );

    expect(container).toMatchSnapshot();
  });
});
