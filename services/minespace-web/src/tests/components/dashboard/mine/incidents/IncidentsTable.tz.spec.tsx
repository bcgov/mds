import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import IncidentsTable from "@/components/dashboard/mine/incidents/IncidentsTable";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BC_MATRIX, Row, expectRows } from "@mds/common/tests/utils/bcTimezoneFixtures";

describe("BC timezone change: MineSpace incidents table", () => {
  it("shows each incident's occurred-on time in its own zone", () => {
    const data = BC_MATRIX.map(([, instant], index) => ({
      mine_incident_guid: `guid-${index}`,
      mine_guid: "mine-1",
      incident_timestamp: instant,
      incident_timezone: "Canada/Pacific",
    })) as any[];
    const pageData = {
      records: data,
      current_page: 1,
      items_per_page: 20,
      total: data.length,
    } as any;

    const { container } = render(
      <ReduxWrapper>
        <MemoryRouter>
          <IncidentsTable isLoaded data={data} pageData={pageData} handleSearch={jest.fn()} />
        </MemoryRouter>
      </ReduxWrapper>
    );
    const cells = Array.from(container.querySelectorAll('span[title="Occurred On"]')).map(
      (el) => el.textContent ?? ""
    );
    expectRows(
      BC_MATRIX.map(
        ([scenario, instant, , text, abbreviation], index): Row => [
          scenario,
          instant,
          `${text} (${abbreviation})`,
          cells[index] ?? "missing",
        ]
      )
    );
  });
});
