import React from "react";
import { render, waitFor } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import {
    complianceReportReducerType,
} from "@mds/common/redux/slices/complianceReportsSlice";
import ComplianceManagement from "./ComplianceManagement";
import queryString from "query-string";

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
})