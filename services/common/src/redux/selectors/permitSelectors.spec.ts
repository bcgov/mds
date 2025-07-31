import {
  formatPermit,
  getAmendment,
  getAmendmentByGuid,
  getEditingConditionFlag,
  getEditingPreambleFlag,
  getLatestAmendmentByPermitGuid,
  getPermitByGuid,
  getReportRequirementsByCondition,
} from "@mds/common/redux/selectors/permitSelectors";
import { permitReducer } from "@mds/common/redux/reducers/permitReducer";
import {
  storeEditingConditionFlag,
  storeEditingPreambleFlag,
  storePermits,
} from "@mds/common/redux/actions/permitActions";
import { NOTICE_OF_WORK, PERMITS } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { RootState } from "../rootState";
import { createItemMap } from "../utils/helpers";
import { IPermit } from "@mds/common/interfaces";
import { VC_CONNECTION_STATES, VC_CRED_ISSUE_STATES } from "@mds/common/constants/enums";

const mockFlagsResponse = false;

const mockState = {
  editingConditionFlag: false,
  editingPreambleFlag: false,
};

const mockPermits = MOCK.PERMITS;
describe("permitSelectors", () => {
  const { editingConditionFlag, editingPreambleFlag } = mockState;

  it("`getEditingConditionFlag` calls `permitReducer.getEditingConditionFlag`", () => {
    const storeAction = storeEditingConditionFlag(mockFlagsResponse);
    const storeState = permitReducer({} as any, storeAction);
    const localMockState = {
      [PERMITS]: storeState,
    };
    expect(getEditingConditionFlag(localMockState as RootState)).toEqual(editingConditionFlag);
  });

  it("`getEditingPreambleFlag` calls `permitReducer.getEditingPreambleFlag`", () => {
    const storeAction = storeEditingPreambleFlag(mockFlagsResponse);
    const storeState = permitReducer({} as any, storeAction);
    const localMockState = {
      [PERMITS]: storeState,
    };
    expect(getEditingPreambleFlag(localMockState as RootState)).toEqual(editingPreambleFlag);
  });
  it("getPermitByGuid returns the correct permit", () => {
    const localMockState = {
      [PERMITS]: { permits: mockPermits },
      [NOTICE_OF_WORK]: {
        noticeOfWork: {}
      },
    };
    const permit = formatPermit(MOCK.PERMITS[1]);
    const actual = getPermitByGuid(permit.permit_guid)(localMockState as RootState);
    expect(actual).toEqual(permit);
  });
  it("`getLatestAmendmentByPermitGuid returns the latest permit amendment", () => {

    const storeAction = storePermits({ records: MOCK.PERMITS });

    const permit = MOCK.PERMITS[0];

    const storeState = permitReducer({} as any, storeAction);

    const localMockState = {
      [PERMITS]: storeState,
    };

    const latestAmendment = getLatestAmendmentByPermitGuid(permit.permit_guid)(
      localMockState as RootState
    );

    expect(latestAmendment).toEqual(MOCK.PERMITS[0].permit_amendments[0]);
  });
});
it("getAmendment returns the correct permit amendment", () => {
  const localMockState = {
    [PERMITS]: { permits: mockPermits },
    [NOTICE_OF_WORK]: {
      noticeOfWork: {}
    },
  };
  const permit = MOCK.PERMITS[0];
  const amendment = permit.permit_amendments[0];

  const actual = getAmendment(permit.permit_guid, amendment.permit_amendment_guid)(
    localMockState as RootState
  );

  expect(actual).toEqual(amendment);
});
it("getAmendmentByGuid returns the correct permit amendment", () => {
  const amendments = mockPermits.reduce((acc, permit) => { return [...acc, ...permit.permit_amendments] }, [])
  const localMockState = {
    [PERMITS]: {
      permits: mockPermits,
      permitAmendments: createItemMap(amendments, "permit_amendment_guid")
    },
  };
  const permit = MOCK.PERMITS[0];
  const amendment = permit.permit_amendments[0];

  const actual = getAmendmentByGuid(amendment.permit_amendment_guid)(
    localMockState as RootState
  );

  expect(actual).toEqual(amendment);
});

describe("getReportRequirementsByCondition", () => {
  const permit_guid = "permit-1-guid";
  const amendment_guid = "amendment-1-guid";
  const topConditionId = 1001;
  const subConditionId = 1002;
  const unrelatedConditionId = 2001;

  const mockRequirementTop = {
    mine_report_permit_requirement_id: 1,
    report_name: "Report for Top",
    cim_or_cpo: "CIM",
    ministry_recipient: ["MMO"],
    permit_condition_ids: [topConditionId],
    due_date_period_months: 6,
    initial_due_date: "2025-05-14",
    permit_amendment_id: 1,
  };
  const mockRequirementSub = {
    mine_report_permit_requirement_id: 2,
    report_name: "Report for Sub",
    cim_or_cpo: "CPO",
    ministry_recipient: ["HS"],
    permit_condition_ids: [subConditionId],
    due_date_period_months: 12,
    initial_due_date: "2025-05-14",
    permit_amendment_id: 1,
  };
  const mockRequirementUnrelated = {
    mine_report_permit_requirement_id: 3,
    report_name: "Unrelated Report",
    cim_or_cpo: "CIM",
    ministry_recipient: ["MMO"],
    permit_condition_ids: [unrelatedConditionId],
    due_date_period_months: 3,
    initial_due_date: "2025-05-14",
    permit_amendment_id: 1,
  };

  const mockPermit: IPermit = {
    permit_guid,
    permit_id: "permit-1-id",
    permit_no: "P-0001",
    permit_status_code: "ACT",
    current_permittee: "permittee-1",
    current_permittee_digital_wallet_connection_state: VC_CONNECTION_STATES.null,
    current_permittee_guid: "permittee-guid-1",
    project_id: "project-1",
    remaining_static_liability: 0,
    assessed_liability_total: 0,
    confiscated_bond_total: 0,
    active_bond_total: 0,
    bonds: [],
    exemption_fee_status_code: "",
    exemption_fee_status_note: "",
    // @ts-ignore - site_properties is an array from the BE but formatted it becomes an object.
    site_properties: [],
    permit_prefix: "P",
    update_user: "user-1",
    update_timestamp: "2025-05-14T00:00:00Z",
    permit_amendments: [
      {
        permit_amendment_guid: amendment_guid,
        permit_amendment_id: 1,
        permit_no: "P-0001-A1",
        permit_amendment_status_code: "ACT",
        permit_amendment_type_code: "OG",
        received_date: "2025-05-01",
        issue_date: "2025-05-10",
        authorization_end_date: "2026-05-10",
        liability_adjustment: 0,
        security_received_date: "2025-05-10",
        security_not_required: false,
        security_not_required_reason: "",
        description: "Amendment 1",
        issuing_inspector_title: "Inspector",
        regional_office: "Office-1",
        now_application_guid: "now-app-guid-1",
        now_application_documents: [],
        imported_now_application_documents: [],
        related_documents: [],
        permit_conditions_last_updated_by: "user-1",
        permit_conditions_last_updated_date: "2025-05-10T00:00:00Z",
        has_permit_conditions: true,
        is_generated_in_core: true,
        preamble_text: "Preamble text",
        vc_credential_exch_state: VC_CRED_ISSUE_STATES.null,
        condition_categories: [],
        conditions_review_completed: false,
        conditions: [
          {
            permit_condition_id: topConditionId,
            permit_amendment_id: 1,
            permit_condition_guid: "cond-guid-1001",
            condition: "Top level condition",
            condition_type_code: "TYP1",
            condition_category_code: "CAT1",
            parent_permit_condition_id: undefined,
            sub_conditions: [
              {
                permit_condition_id: subConditionId,
                permit_amendment_id: 1,
                permit_condition_guid: "cond-guid-1002",
                condition: "Sub condition",
                condition_type_code: "TYP2",
                condition_category_code: "CAT1",
                parent_permit_condition_id: topConditionId,
                sub_conditions: [],
                step: "1.1",
                display_order: 1,
                permit_condition_status_code: "ACT",
                top_level_parent_permit_condition_id: topConditionId,
                condition_tags: []
              },
            ],
            step: "1",
            display_order: 0,
            permit_condition_status_code: "ACT",
            top_level_parent_permit_condition_id: undefined,
            condition_tags: []
          },
          {
            permit_condition_id: unrelatedConditionId,
            permit_amendment_id: 1,
            permit_condition_guid: "cond-guid-2001",
            condition: "Unrelated condition",
            condition_type_code: "TYP3",
            condition_category_code: "CAT2",
            parent_permit_condition_id: undefined,
            sub_conditions: [],
            step: "2",
            display_order: 2,
            permit_condition_status_code: "ACT",
            top_level_parent_permit_condition_id: undefined,
            condition_tags: []
          },
        ],
        mine_report_permit_requirements: [
          mockRequirementTop,
          mockRequirementSub,
          mockRequirementUnrelated,
        ],
      },
    ],
  }

  const mockState = {
    [PERMITS]: {
      permits: [mockPermit],
    },
    [NOTICE_OF_WORK]: {
      noticeOfWork: {}
    },
  };

  it("returns requirements for a top-level condition and its sub-conditions", () => {
    const selector = getReportRequirementsByCondition(permit_guid, amendment_guid, topConditionId);
    const result = selector(mockState as any);
    expect(result).toEqual(
      expect.arrayContaining([
        mockRequirementTop,
        mockRequirementSub,
      ])
    );
    expect(result).not.toEqual(
      expect.arrayContaining([
        mockRequirementUnrelated,
      ])
    );
  });

  it("returns empty array for a condition with no requirements", () => {
    const selector = getReportRequirementsByCondition(permit_guid, amendment_guid, 9999);
    const result = selector(mockState as any);
    expect(result).toEqual([]);
  });
});
