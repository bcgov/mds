import React from "react";
import { shallow } from "enzyme";
import { ReviewNOWApplication } from "@/components/noticeOfWork/applications/review/ReviewNOWApplication";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";

const reducerProps = {
  isViewMode: true,
  noticeOfWork: NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
  reclamationSummary: NOW_MOCK.RECLAMATION_SUMMARY,
  renderOriginalValues: jest.fn().mockReturnValue({ value: "N/A", edited: true }),
  userRoles: [],
};

const props = {
  contacts: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.contacts,
  now_application_guid: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.now_application_guid,
  documents: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.documents,
  filtered_submission_documents: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.filtered_submission_documents,
  importNowSubmissionDocumentsJob: NOW_MOCK.IMPORT_NOTICE_OF_WORK_SUBMISSION_DOCUMENTS_JOB,
  regionDropdownOptions: NOW_MOCK.DROPDOWN_APPLICATION_TYPES,
  applicationTypeOptions: NOW_MOCK.APPLICATION_TYPES.records,
  noticeOfWorkType: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.notice_of_work_type_code,
  permitTypeHash: {},
  regionHash: {},
  applicationTypeOptionsHash: NOW_MOCK.APPLICATION_TYPES_HASH,
  permitTypeOptions: [],
  initialValues: NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
  proposedTonnage: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.proposed_annual_maximum_tonnage,
  adjustedTonnage: Number(NOW_MOCK.IMPORTED_NOTICE_OF_WORK.adjusted_annual_maximum_tonnage) || 0,
  proposedStartDate: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.proposed_start_date,
  proposedAuthorizationEndDate: NOW_MOCK.IMPORTED_NOTICE_OF_WORK.proposed_end_date,
  isPreLaunch: false,
  isNoticeOfWorkTypeDisabled: false,
  editableApplicationTypeOptions: NOW_MOCK.DROPDOWN_APPLICATION_TYPES,
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
};

describe("ReviewNOWApplication", () => {
  it("renders properly", () => {
    const component = shallow(<ReviewNOWApplication {...props} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
