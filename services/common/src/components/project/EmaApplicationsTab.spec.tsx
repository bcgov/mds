import React from "react";
import { render } from "@testing-library/react";
import EmaApplicationsTab from "./EmaApplicationsTab";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PROJECTS } from "@mds/common/constants/reducerTypes";
import { BrowserRouter } from "react-router-dom";

const initialState = {
    [PROJECTS]: {
        project: {
            ...MOCK.PROJECT,
            project_summary: {
                ...MOCK.PROJECT.project_summary,
                authorizations: [
                    {
                        project_summary_authorization_guid: "c47161c0-8860-4125-8e68-fac3d98cf429",
                        project_summary_guid: "8b4b9781-2e59-43ef-8164-4cc3b964417a",
                        project_summary_permit_type: ["AMENDMENT"],
                        project_summary_authorization_type: "REFUSE_DISCHARGE_PERMIT",
                        existing_permits_authorizations: ['112497'],
                        amendment_changes: ['OTH'],
                        amendment_severity: "SIG",
                        is_contaminated: false,
                        new_type: null,
                        authorization_description: "asdf",
                        exemption_reason: "asdasdas",
                        amendment_documents: [],
                        exemption_requested: false,
                        ams_tracking_number: "442542",
                        ams_outcome: ["Successfully create new Authorization Amendment."],
                        ams_status_code: "200",
                        ams_submission_timestamp: "2024-05-24T19:17:09.212499+00:00",
                    }
                ]
            }
        },
    },
};

describe("EmaApplicationsTab", () => {
    it("renders properly", async () => {
        const { findByTestId } = render(
            <ReduxWrapper initialState={initialState}>
                <BrowserRouter>
                    <EmaApplicationsTab />
                </BrowserRouter>
            </ReduxWrapper>
        );

        const emaApplicationsContent = await findByTestId("ema-applications-content");
        expect(emaApplicationsContent).toMatchSnapshot();
    });
});
