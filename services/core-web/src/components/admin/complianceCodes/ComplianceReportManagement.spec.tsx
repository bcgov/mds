import React from "react";
import { render } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import {
    complianceReportReducerType,
} from "@mds/common/redux/slices/complianceReportsSlice";
import { REPORTS } from "@mds/common/constants/reducerTypes";
import ComplianceManagement from "./ComplianceManagement";
import queryString from "query-string";

const reportParams = {
    page: '1',
    per_page: '50',
    is_prr_only: 'false',
    regulatory_authority: ['CIM', 'CPO'],
    section: '1.1',
    sort_dir: 'asc',
    sort_field: 'report_name'
};
const reportParamsString = queryString.stringify(reportParams);
const initialState = {
    [REPORTS]: { mineReports: MOCK.MINE_REPORTS, reportsPageData: MOCK.PAGE_DATA },
    [complianceReportReducerType]: {
        reportPageData: {
            records: MOCK.MINE_REPORT_DEFINITION_OPTIONS,
            current_page: 1,
            items_per_page: MOCK.MINE_REPORT_DEFINITION_OPTIONS.length,
            total: MOCK.MINE_REPORT_DEFINITION_OPTIONS.length,
            total_pages: 1,
        },
        params: reportParams,
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
    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <ComplianceManagement />
            </ReduxWrapper>
        );

        expect(container).toMatchSnapshot();
    });
})