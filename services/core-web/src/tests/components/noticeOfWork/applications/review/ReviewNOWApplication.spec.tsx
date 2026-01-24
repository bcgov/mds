import React from "react";
import { ReviewNOWApplication } from "@/components/noticeOfWork/applications/review/ReviewNOWApplication";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import * as FORM from "@/constants/forms";

const initialState = {
  form: {
    [FORM.EDIT_NOTICE_OF_WORK]: {
      values: {
        contacts: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.contacts,
        now_application_guid: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.now_application_guid,
        documents: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.documents,
        submission_documents: [],
        imported_submission_documents: [],
        filtered_submission_documents:
          NOW_MOCK.IMPORTED_NOTICE_OF_WORK.filtered_submission_documents,

        proposed_annual_maximum_tonnage:
          NOW_MOCK.IMPORTED_NOTICE_OF_WORK.proposed_annual_maximum_tonnage,
        adjusted_annual_maximum_tonnage:
          NOW_MOCK.IMPORTED_NOTICE_OF_WORK.adjusted_annual_maximum_tonnage,
        proposed_start_date: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.proposed_start_date,
        proposed_end_date: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.proposed_end_date,

        type_of_application: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.application_type_code,
        application_permit_type_code: "",
        has_surface_disturbance_outside_tenure: false,
        is_access_gated: false,
        proposedTonnage: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.proposed_annual_maximum_tonnage,
        adjustedTonnage: Number(NOW_MOCK.IMPORTED_NOTICE_OF_WORK.adjusted_annual_maximum_tonnage) || 0,
        proposedStartDate: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.proposed_start_date,
        proposedAuthorizationEndDate: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.proposed_end_date,
        typeOfApplication: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.application_type_code,
        applicationPermitType: "",
        surfaceDisturbance: false,
        isOnPrivateLand: false,
        activitiesInPark: false,
        lieutenantGovernorAuthorization: false,
        archaeologySitesAffected: false,
        sharedInfoWithFn: false,
        acknowledgedUNDRIP: false,
        culturalHeritageSites: false,
        appliedLicenceOccupation: false,
        isOnCrownLand: false,
        hasLicenceOfOccupation: false,
        isAccessGated: false,

        state_of_land: {
          is_on_private_land: false,
          has_activity_in_park: false,
          has_auth_lieutenant_gov_council: false,
          has_archaeology_sites_affected: false,
          has_shared_info_with_fn: false,
          has_acknowledged_undrip: false,
          has_fn_cultural_heritage_sites_in_area: false,
          is_on_crown_land: false,
          has_licence_of_occupation: false,
          applied_for_licence_of_occupation: false,
        },
      },
    },
  },

  noticeOfWork: {
    regionDropdownOptions: NOW_MOCK.DROPDOWN_APPLICATION_TYPES,
    applicationTypeOptions: NOW_MOCK.APPLICATION_TYPES.records,
    editableApplicationTypeOptions: NOW_MOCK.DROPDOWN_APPLICATION_TYPES,
    applicationProgressStatusCodes: [],
    permitTypeOptions: [],
    regionHash: {},
    permitTypeHash: {},
    applicationTypeOptionsHash: NOW_MOCK.APPLICATION_TYPES_HASH,
  },

  authentication: {
    userAccessData: [],
  },
};

const reducerProps = {
  isViewMode: true,
  noticeOfWork: NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
  reclamationSummary: NOW_MOCK.RECLAMATION_SUMMARY,
  renderOriginalValues: jest.fn().mockReturnValue({ value: "N/A", edited: true }),
  userRoles: [],
};

const props = {
  importNowSubmissionDocumentsJob: NOW_MOCK.IMPORT_NOTICE_OF_WORK_SUBMISSION_DOCUMENTS_JOB,
  noticeOfWorkType: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.notice_of_work_type_code,
  initialValues: NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
  isPreLaunch: false,
  isNoticeOfWorkTypeDisabled: false,
};

describe("ReviewNOWApplication", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <ReviewNOWApplication {...props} {...reducerProps} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
