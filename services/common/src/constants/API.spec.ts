import * as API from "./API";

describe("API", () => {
  it("should have correct values for NOTICE_OF_WORK_APPLICATION_TIER_HISTORY", () => {
    const guid = "123";
    expect(API.NOTICE_OF_WORK_APPLICATION_TIER_HISTORY(guid)).toBe(`/now-applications/${guid}/tier-history`);
  });

  it("should have correct values for NOTICE_OF_WORK_APPLICATION_NATION", () => {
    const guid = "123";
    const nationGuid = "456";
    expect(API.NOTICE_OF_WORK_APPLICATION_NATION(guid, nationGuid)).toBe(`/now-applications/${guid}/nation/${nationGuid}`);
    expect(API.NOTICE_OF_WORK_APPLICATION_NATION(guid)).toBe(`/now-applications/${guid}/nation`);
  });

  it("should have correct values for NOTICE_OF_WORK_APPLICATION_NATION_EVENT", () => {
    const guid = "123";
    const nationGuid = "456";
    expect(API.NOTICE_OF_WORK_APPLICATION_NATION_EVENT(guid, nationGuid)).toBe(`/now-applications/${guid}/nation/${nationGuid}/event`);
  });

  it("should have correct values for PIP_CONSULTATION_AREA_DATA", () => {
    expect(API.PIP_CONSULTATION_AREA_DATA).toBe(`/now-applications/pip-consultation-area`);
  });

  it("should have correct values for MINE_RECLAMATION_INVOICES", () => {
    const guid = "123";
    expect(API.MINE_RECLAMATION_INVOICES(guid)).toBe(`/securities/reclamation-invoices?mine_guid=${guid}`);
  });

  it("should have correct values for RECLAMATION_INVOICE", () => {
    const guid = "123";
    expect(API.RECLAMATION_INVOICE(guid)).toBe(`/securities/reclamation-invoices/${guid}`);
    expect(API.RECLAMATION_INVOICE(undefined)).toBe("/securities/reclamation-invoices");
  });

  it("should have correct values for RECLAMATION_INVOICE_DOCUMENTS", () => {
    const guid = "123";
    expect(API.RECLAMATION_INVOICE_DOCUMENTS(guid)).toBe(`/securities/${guid}/reclamation-invoices/documents`);
  });

  it("should have correct values for APP_HELP", () => {
    const helpKey = "test";
    const params = { system: "MDS" };
    expect(API.APP_HELP(helpKey, params)).toBe(`/help/${helpKey}?system=MDS`);
  });

  it("should have correct values for NOTICE_OF_WORK_APPLICATION", () => {
    const guid = "123";
    expect(API.NOTICE_OF_WORK_APPLICATION(guid)).toBe(`/now-applications/${guid}`);
  });

  it("should have correct values for NOTICE_OF_WORK_APPLICATION_STATUS", () => {
    const guid = "123";
    expect(API.NOTICE_OF_WORK_APPLICATION_STATUS(guid)).toBe(`/now-applications/${guid}/status`);
  });

  it("should have correct values for PERMITS", () => {
    const guid = "123";
    expect(API.PERMITS(guid)).toBe(`/mines/${guid}/permits`);
  });

  it("should have correct values for PERMIT_AMENDMENTS", () => {
    const mineGuid = "123";
    const permitGuid = "456";
    expect(API.PERMIT_AMENDMENTS(mineGuid, permitGuid)).toBe(`/mines/${mineGuid}/permits/${permitGuid}/amendments`);
  });

  it("should have correct values for SEARCH", () => {
    const params = { q: "test" };
    expect(API.SEARCH(params)).toBe("/search?q=test");
    expect(API.SEARCH(undefined)).toBe("/search");
  });

  it("should have correct values for VARIANCES", () => {
    const params = { mine_guid: "123" };
    expect(API.VARIANCES(params)).toBe("/variances?mine_guid=123");
    expect(API.VARIANCES()).toBe("/variances?");
  });

  it("should have correct values for PROJECT", () => {
    const guid = "123";
    expect(API.PROJECT(guid)).toBe(`/projects/${guid}`);
  });

  it("should have correct values for MINE_INCIDENTS", () => {
    const guid = "123";
    expect(API.MINE_INCIDENTS(guid)).toBe(`/mines/${guid}/incidents?`);
  });

  it("should have correct values for REPORTS", () => {
    expect(API.REPORTS()).toBe("/mines/reports?");
  });

  it("should have correct values for MINE_TENURE_TYPES", () => {
    expect(API.MINE_TENURE_TYPES).toBe("/mines/mine-tenure-type-codes");
  });

  it("should have correct values for PROVINCE_CODES", () => {
    expect(API.PROVINCE_CODES).toBe("/parties/sub-division-codes");
  });

  it("should have correct values for MINISTRY_CONTACTS", () => {
    expect(API.MINISTRY_CONTACTS).toBe("/ministry-contacts");
  });

  it("should have correct values for PERMIT_STATUS_CODES", () => {
    expect(API.PERMIT_STATUS_CODES()).toBe("/mines/permits/status-codes");
  });

  it("should have correct values for NOTICES_OF_DEPARTURE", () => {
    expect(API.NOTICES_OF_DEPARTURE()).toBe("/notices-of-departure");
  });

  it("should have correct values for SEARCH_OPTIONS", () => {
    expect(API.SEARCH_OPTIONS).toBe("/search/options");
  });

  it("should have correct values for COMPLIANCE_CODES", () => {
    expect(API.COMPLIANCE_CODES).toBe("/compliance/codes");
  });

  it("should have correct values for VARIANCE_STATUS_CODES", () => {
    expect(API.VARIANCE_STATUS_CODES).toBe("/variances/status-codes");
  });

  it("should have correct values for CORE_USER", () => {
    expect(API.CORE_USER).toBe("/users/core");
  });

  it("should have correct values for INCIDENT_STATUS_CODES", () => {
    expect(API.INCIDENT_STATUS_CODES).toBe("/incidents/status-codes");
  });

  it("should have correct values for various constants", () => {
    expect(API.MINE).toBe("/mines");
    expect(API.MINE_LIST).toBe("/mines");
    expect(API.SUBSCRIPTION("123")).toBe("/mines/123/subscribe");
    expect(API.MINE_SUBSCRIPTION).toBe("/mines/subscribe");
    expect(API.MINE_MAP_LIST).toBe("/mines/map-list");
    expect(API.MINE_BASIC_INFO_LIST).toBe("/mines/basicinfo");
    expect(API.PARTY).toBe("/parties");
    expect(API.MANAGER).toBe("/parties/managers");
    expect(API.PARTY_RELATIONSHIP).toBe("/parties/mines");
    expect(API.PERMITTEE).toBe("/permits/permittees");
    expect(API.MINE_STATUS).toBe("/mines/status");
    expect(API.MINE_REGION).toBe("/mines/region");
    expect(API.DISTURBANCE_CODES).toBe("/mines/disturbance-codes");
    expect(API.COMMODITY_CODES).toBe("/mines/commodity-codes");
    expect(API.MINE_TENURE_TYPES).toBe("/mines/mine-tenure-type-codes");
    expect(API.MINE_TYPES_DETAILS).toBe("/mines/mine-types/details");
    expect(API.MINISTRY_CONTACTS).toBe("/ministry-contacts");
    expect(API.MINISTRY_CONTACT("123")).toBe("/ministry-contacts/123");
    expect(API.PERMIT_STATUS_CODES()).toBe("/mines/permits/status-codes");
    expect(API.EXPLOSIVES_PERMIT_DOCUMENT_TYPE_OPTIONS).toBe("/mines/explosives-permit-document-types");
    expect(API.REPORT_ERROR).toBe("/report-error");
    expect(API.SEARCH_OPTIONS).toBe("/search/options");
    expect(API.SIMPLE_SEARCH).toBe("/search/simple");
    expect(API.PERMIT_CONDITION_SEARCH).toBe("/search/permit-conditions");
    expect(API.COMPLIANCE_CODES).toBe("/compliance/codes");
    expect(API.VARIANCE_STATUS_CODES).toBe("/variances/status-codes");
    expect(API.VARIANCE_DOCUMENT_CATEGORY_OPTIONS).toBe("/variances/document-categories");
    expect(API.NEW_PROJECT_SUMMARY()).toBe("/projects/new/project-summaries/new");
    expect(API.PROJECT_SUMMARY_ENVIRONMENT_AUTHORIZATION_STATUSES()).toBe("/projects/project-summary-environment-authorization-statuses");
    expect(API.CORE_USER).toBe("/users/core");
    expect(API.INCIDENT_FOLLOWUP_ACTIONS).toBe("/incidents/followup-types");
    expect(API.INCIDENT_DETERMINATION_TYPES).toBe("/incidents/determination-types");
    expect(API.INCIDENT_DOCUMENT_TYPE).toBe("/incidents/document-types");
    expect(API.INCIDENT_CATEGORY_CODES).toBe("/incidents/category-codes");
    expect(API.COMPLETE_SPATIAL_BUNDLE).toBe("/documents/complete-bundle");
    expect(API.CORE_API_DOCUMENT_BUNDLE).toBe("/mines/document-bundle/");
  });

  it("should have correct values for MINE_PARTY_APPOINTMENT_DOCUMENTS", () => {
    expect(API.MINE_PARTY_APPOINTMENT_DOCUMENTS("123", "456")).toBe("/mines/123/party-appts/456/documents");
  });

  it("should have correct values for NRIS URLs", () => {
    expect(API.NRIS_DOCUMENT_TOKEN_GET_URL("ext1", "ins1", "file.pdf")).toBe("/compliance/inspection/ins1/document/ext1/token?file_name=file.pdf");
    expect(API.NRIS_DOCUMENT_FILE_GET_URL("ext1", "ins1", { token: "abc" })).toBe("/compliance/inspection/ins1/document/ext1?token=abc");
  });

  it("should have correct values for BOND URLs", () => {
    expect(API.MINE_BONDS("123")).toBe("/securities/bonds?mine_guid=123");
    expect(API.BOND("456")).toBe("/securities/bonds/456");
    expect(API.BOND(undefined)).toBe("/securities/bonds");
    expect(API.BOND_TRANSFER("456")).toBe("/securities/bonds/456/transfer");
    expect(API.BOND_DOCUMENTS("123")).toBe("/securities/123/bonds/documents");
  });

  it("should have correct values for ORGBOOK URLs", () => {
    expect(API.BC_REGISTRATION_SEARCH("test")).toBe("/bc-registration/search?search_name=test");
    expect(API.ORGBOOK_CREDENTIAL("cred1")).toBe("/bc-registration/orgbook/credential/cred1");
  });

  it("should have correct values for DAM URLs", () => {
    expect(API.DAMS()).toBe("/dams");
    expect(API.DAM("123")).toBe("/dams/123");
    expect(API.DAM(undefined)).toBe("/dams");
  });

  it("should have correct values for REGIONS_LIST", () => {
    expect(API.REGIONS_LIST).toBe("/regions");
  });

  it("should have correct values for USER_PROFILE", () => {
    expect(API.USER_PROFILE()).toBe("/users/profile");
  });

  it("should have correct values for remaining constants", () => {
    expect(API.MINE_TSF("mine1", "tsf1")).toBe("/mines/mine1/tailings/tsf1");
    expect(API.MINE_TYPES("mine1")).toBe("/mines/mine1/mine-types");
    expect(API.DOCUMENT_MANAGER_TOKEN_GET_URL("doc1")).toBe("/download-token/doc1");
    expect(API.DOCUMENT_MANAGER_DOCUMENT("doc1")).toBe("/documents/doc1");
    expect(API.MINESPACE_USER("mine1")).toBe("/users/minespace?mine_guid=mine1");
    expect(API.UPDATE_MINESPACE_USER("user1")).toBe("/users/minespace/user1");
    expect(API.MINISTRY_CONTACTS_BY_REGION("REG", true)).toBe("/ministry-contacts/REG/contacts?is_major_mine=true");
    expect(API.MINE_VERIFIED_STATUS("mine1")).toBe("/mines/mine1/verified-status");
    expect(API.PERMIT_AMENDMENT("mine1", "perm1", "amend1")).toBe("/mines/mine1/permits/perm1/amendments/amend1");
    expect(API.PERMIT_CONDITION("mine1", "perm1", "amend1", "cond1")).toBe("/mines/mine1/permits/perm1/amendments/amend1/conditions/cond1");
    expect(API.STANDARD_PERMIT_CONDITIONS("type1")).toBe("/mines/permits/standard-conditions/type1");
    expect(API.STANDARD_PERMIT_CONDITION("cond1")).toBe("/mines/permits/standard-conditions/cond1");
    expect(API.PERMIT_CONDITION_TAG("tag1")).toBe("/mines/permits/condition-tags/tag1");
    expect(API.NOTICES_OF_DEPARTURE_DOCUMENTS("nod1")).toBe("/notices-of-departure/nod1/documents");
    expect(API.EXPLOSIVES_PERMITS("mine1")).toBe("/mines/mine1/explosives-permits");
    expect(API.EPIC_INFO("mine1")).toBe("/mines/mine1/epic");
    expect(API.VARIANCE("mine1", "var1")).toBe("/mines/mine1/variances/var1");
    expect(API.PROJECT_SUMMARY("proj1", "sum1")).toBe("/projects/proj1/project-summaries/sum1");
    expect(API.PROJECT_LINKS("proj1", "link1")).toBe("/projects/proj1/project-link/link1");
    expect(API.INFORMATION_REQUIREMENTS_TABLE("proj1", "irt1")).toBe("/projects/proj1/information-requirements-table/irt1");
    expect(API.MAJOR_MINE_APPLICATION("proj1", "app1")).toBe("/projects/proj1/major-mine-application/app1");
    expect(API.MINE_INCIDENT("mine1", "inc1")).toBe("/mines/mine1/incidents/inc1");
    expect(API.MINE_WORK_INFORMATION("mine1", "work1")).toBe("/mines/mine1/work-information/work1");
  });
});
