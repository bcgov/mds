import React from "react";
import ReviewNOWApplication from
  "@/components/noticeOfWork/applications/review/ReviewNOWApplication";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import * as FORM from "@/constants/forms";
import { AUTHENTICATION, NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";
import { USER_ROLES } from "@mds/common/constants/environment";

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
        proposed_end_date: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.proposed_end_date,
        application_permit_type_code: "",
        has_surface_disturbance_outside_tenure: false,
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
      },
    },
  },

  [NOTICE_OF_WORK]: {
    applicationDelays: [],
    noticeOfWork: {
      ...NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
    },
    regionDropdownOptions: NOW_MOCK.DROPDOWN_APPLICATION_TYPES,
    applicationTypeOptions: NOW_MOCK.APPLICATION_TYPES.records,
    editableApplicationTypeOptions: NOW_MOCK.DROPDOWN_APPLICATION_TYPES,
    applicationProgressStatusCodes: [],
    permitTypeOptions: [],
    regionHash: {},
    permitTypeHash: {},
    applicationTypeOptionsHash: NOW_MOCK.APPLICATION_TYPES_HASH,
  },

  [AUTHENTICATION]: {
    userAccessData: [USER_ROLES.role_admin],
  }
};

const reducerProps = {
  isViewMode: true,
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
  noticeOfWork: NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
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
