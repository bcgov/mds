import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MineIncidentTable from "@/components/mine/Incidents/MineIncidentTable";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import {
    BC_MATRIX,
    Row,
    expectRows,
} from "@mds/common/tests/utils/bcTimezoneFixtures";

describe("BC timezone change: Core incidents table", () => {
    it("shows each incident's occurred-on time in its own zone", () => {
        const incidents = BC_MATRIX.map(([, instant], index) => ({
            mine_incident_guid: `guid-${index}`,
            mine_guid: "mine-1",
            mine_incident_report_no: `2026-${index}`,
            incident_timestamp: instant,
            incident_timezone: "Canada/Pacific",
            categories: [],
            documents: [],
            dangerous_occurrence_subparagraph_ids: [],
        })) as any[];

        const { container } = render(
            <ReduxWrapper>
                <MemoryRouter>
                    <MineIncidentTable
                        {...({
                            incidents,
                            followupActions: [],
                            isLoaded: true,
                            isDashboardView: false,
                            pageData: { records: incidents, current_page: 1, items_per_page: 20, total: incidents.length },
                            handleUpdate: jest.fn(),
                            handleEditMineIncident: jest.fn(),
                            handleDeleteMineIncident: jest.fn(),
                        } as any)}
                    />
                </MemoryRouter>
            </ReduxWrapper>
        );
        const cells = Array.from(container.querySelectorAll('span[title="Occurred On"]')).map(
            (el) => el.textContent ?? ""
        );
        expectRows(
            BC_MATRIX.map(([scenario, instant, , text, abbreviation], index): Row => [
                scenario,
                instant,
                `${text} (${abbreviation})`,
                cells[index] ?? "missing",
            ])
        );
    });
});
