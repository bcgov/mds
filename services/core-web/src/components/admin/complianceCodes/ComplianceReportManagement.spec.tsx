import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import {
    complianceReportReducerType,
} from "@mds/common/redux/slices/complianceReportsSlice";
import ComplianceManagement from "./ComplianceManagement";
import queryString from "query-string";
import * as modalActions from "@mds/common/redux/actions/modalActions";

const reportParams = {
    page: 1,
    per_page: 10,
    is_prr_only: 'false',
    regulatory_authority: ['CIM', 'CPO'],
    section: '1.1',
    sort_dir: 'asc',
    sort_field: 'report_name'
};
const reportParamsString = queryString.stringify(reportParams);

const initialState = {
    [complianceReportReducerType]: {
        reportPageData: {
            records: [],
            current_page: 0,
            items_per_page: 0,
            total: 0,
            total_pages: 0
        },
        params: {}
    },
};

function mockFunction() {
    const original = jest.requireActual("react-router-dom");
    return {
        ...original,
        useParams: jest.fn().mockReturnValue({
            tab: "reports"
        }),
        // mockImplementation (vs mockReturnValue) necessary to avoid a ReferenceError
        useLocation: jest.fn().mockImplementation(() => ({ search: reportParamsString })),
        useHistory: jest.fn().mockReturnValue({
            replace: jest.fn()
        })
    }
};

jest.mock("react-router-dom", () => mockFunction());

jest.mock("@mds/common/redux/actions/modalActions", () => ({
    openModal: jest.fn().mockReturnValue({ type: "OPEN_MODAL", payload: { props: {}, content: null } }),
    closeModal: jest.fn().mockReturnValue({ type: "CLOSE_MODAL" }),
}));

describe("ComplianceReportManagement", () => {
    it("renders properly", async () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <ComplianceManagement />
            </ReduxWrapper>
        );

        const spinner = container.querySelector(".ant-spin-spinning");
        await waitFor(() => {
            expect(spinner).not.toBeInTheDocument();
        })

        expect(container).toMatchSnapshot();
    });

    describe("View modal report_type derivation", () => {
        const routerMock = jest.requireMock("react-router-dom");
        const loadedParams = { page: 1, per_page: 50, show_expired: true };

        const makeRecord = (overrides: object) => ({
            mine_report_definition_guid: "test-guid",
            report_name: "Test Report",
            description: "",
            due_date_period_months: 12,
            mine_report_due_date_type: "FIS",
            default_due_date: null,
            categories: [],
            compliance_articles: [{
                compliance_article_id: 1,
                article_act_code: "HSRCM",
                section: "1",
                sub_section: null,
                paragraph: null,
                sub_paragraph: null,
                description: "",
                long_description: "",
                effective_date: "2020-01-01",
                expiry_date: "9999-12-31",
                help_reference_link: "",
                cim_or_cpo: null,
                reports: [],
            }],
            active_ind: true,
            is_common: false,
            is_prr_only: false,
            ...overrides,
        });

        const makeState = (records) => ({
            [complianceReportReducerType]: {
                reportPageData: {
                    records,
                    current_page: 1,
                    items_per_page: 50,
                    total: records.length,
                    total_pages: 1,
                },
                params: loadedParams,
            },
        });

        beforeEach(() => {
            jest.clearAllMocks();
            // Use empty search so queryParams === loadedParams, making isLoaded true
            routerMock.useLocation.mockImplementation(() => ({ search: "" }));
        });

        it("opens modal with report_type CRR and boolean is_prr_only=false for a CRR record", async () => {
            const crrRecord = makeRecord({ mine_report_definition_guid: "crr-guid", is_prr_only: false });
            const { getAllByText, findByTestId } = render(
                <ReduxWrapper initialState={makeState([crrRecord])}>
                    <ComplianceManagement />
                </ReduxWrapper>
            );

            const actionsButton = getAllByText("Actions")[0];
            fireEvent.mouseEnter(actionsButton);
            const viewButton = await findByTestId("action-button-view");
            fireEvent.click(viewButton);

            expect(modalActions.openModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    props: expect.objectContaining({
                        initialValues: expect.objectContaining({
                            report_type: "CRR",
                            is_prr_only: false,
                        }),
                    }),
                })
            );
        });

        it("opens modal with report_type PRR and boolean is_prr_only=true for a PRR record", async () => {
            const prrRecord = makeRecord({ mine_report_definition_guid: "prr-guid", is_prr_only: true });
            const { getAllByText, findByTestId } = render(
                <ReduxWrapper initialState={makeState([prrRecord])}>
                    <ComplianceManagement />
                </ReduxWrapper>
            );

            const actionsButton = getAllByText("Actions")[0];
            fireEvent.mouseEnter(actionsButton);
            const viewButton = await findByTestId("action-button-view");
            fireEvent.click(viewButton);

            expect(modalActions.openModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    props: expect.objectContaining({
                        initialValues: expect.objectContaining({
                            report_type: "PRR",
                            is_prr_only: true,
                        }),
                    }),
                })
            );
        });
    });
})