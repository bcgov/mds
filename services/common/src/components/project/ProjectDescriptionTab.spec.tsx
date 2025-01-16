import React from "react";
import { render } from "@testing-library/react";
import ProjectDescriptionTab from "./ProjectDescriptionTab";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PROJECTS, PERMITS } from "@mds/common/constants/reducerTypes";
import { BrowserRouter } from "react-router-dom";

const initialState = {
  [PROJECTS]: {
    project: {
      ...MOCK.PROJECT,
      project_summary: {
        ...MOCK.PROJECT.project_summary,
        authorizations: [...MOCK.PROJECT.project_summary.authorizations,
        {
          project_summary_authorization_guid: "c47161c0-8860-4125-8e68-fac3d98cf429",
          project_summary_guid: "8b4b9781-2e59-43ef-8164-4cc3b964417a",
          project_summary_permit_type: ["AMENDMENT"],
          project_summary_authorization_type: "REFUSE_DISCHARGE_PERMIT",
          existing_permits_authorizations: ['1234'],
          amendment_changes: null,
          amendment_severity: null,
          is_contaminated: null,
          new_type: "PER",
          authorization_description: "asdf",
          exemption_reason: "asdasdas",
          amendment_documents: [],
          exemption_requested: false,
          ams_tracking_number: "0",
          ams_outcome: "Some error",
          ams_status_code: "400",
          ams_submission_timestamp: "2024-05-24T19:17:09.212499+00:00",
        }
        ]
      }
    },
  },
  [PERMITS]: { permits: MOCK.PERMITS },
};

describe("ProjectDescriptionTab", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <ProjectDescriptionTab />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
