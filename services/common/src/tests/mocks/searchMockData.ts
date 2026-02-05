/**
 * Mock data for V2 search functionality with facets and filters
 */

import { ISearchResultList } from "@mds/common/interfaces/search/searchResult.interface";
import { MINES, PARTY, PERMITS, MINEDOCUMENTS, EXPLOSIVES_PERMITS, NOW } from "./dataMocks";

export const SEARCH_RESULTS_V2: ISearchResultList = {
  mine: [
    {
      type: "mine",
      score: 10.5,
      result: MINES[0],
    },
    {
      type: "mine",
      score: 8.3,
      result: MINES[1],
    },
  ],
  party: [
    {
      type: "party",
      score: 9.2,
      result: PARTY.parties["18133c75-49ad-4101-85f3-a43e35ae989a"],
    },
  ],
  permit: [
    {
      type: "permit",
      score: 8.7,
      result: PERMITS[0],
    },
  ],
  mine_documents: [
    {
      type: "mine_documents",
      score: 6.5,
      result: MINEDOCUMENTS[0],
    },
  ],
  permit_documents: [
    {
      type: "permit_documents",
      score: 6.3,
      result: MINEDOCUMENTS[0],
    },
  ],
  explosives_permit: [
    {
      type: "explosives_permit",
      score: 7.2,
      result: EXPLOSIVES_PERMITS[0],
    },
  ],
  now_application: [
    {
      type: "now_application",
      score: 6.8,
      result: NOW[0],
    }
  ],
  notice_of_departure: [
    {
      type: "notice_of_departure",
      score: 5.9,
      result: {
        nod_guid: "test-nod-guid-1",
        nod_no: "NOD-001",
        nod_title: "Test Notice of Departure",
        mine_name: "Test Mine One",
        nod_status: "pending_review",
        mine_guid: "",
        nod_type: ""
      },
    },
  ],
};

export const SEARCH_FACETS = {
  mine_region: [
    { key: "SW", count: 15 },
    { key: "NE", count: 10 },
    { key: "NW", count: 8 },
    { key: "SE", count: 5 },
    { key: "SC", count: 12 },
  ],
  mine_classification: [
    { key: "Major Mine", count: 20 },
    { key: "Regional Mine", count: 30 },
  ],
  mine_operation_status: [
    { key: "OP", count: 25 },
    { key: "CLD", count: 15 },
    { key: "NS", count: 10 },
  ],
  mine_tenure: [
    { key: "PLR", count: 18 },
    { key: "MIN", count: 12 },
    { key: "BCL", count: 8 },
  ],
  mine_commodity: [
    { key: "CU", count: 15 },
    { key: "AU", count: 12 },
    { key: "AG", count: 8 },
    { key: "ZN", count: 6 },
  ],
  has_tsf: [
    { key: "Yes", count: 22 },
    { key: "No", count: 28 },
  ],
  verified_status: [
    { key: "Verified", count: 35 },
    { key: "Unverified", count: 15 },
  ],
  permit_status: [
    { key: "O", count: 28 },
    { key: "C", count: 12 },
    { key: "D", count: 5 },
  ],
  is_exploration: [
    { key: "Yes", count: 18 },
    { key: "No", count: 27 },
  ],
  party_type: [
    { key: "PER", count: 45 },
    { key: "ORG", count: 30 },
  ],
  explosives_permit_status: [
    { key: "APP", count: 10 },
    { key: "REC", count: 15 },
    { key: "REJ", count: 3 },
  ],
  explosives_permit_closed: [
    { key: "Yes", count: 8 },
    { key: "No", count: 20 },
  ],
  nod_type: [
    { key: "temporary", count: 12 },
    { key: "permanent", count: 8 },
  ],
  nod_status: [
    { key: "pending_review", count: 10 },
    { key: "approved", count: 15 },
    { key: "rejected", count: 3 },
  ],
  now_application_status: [
    { key: "REC", count: 20 },
    { key: "REF", count: 10 },
    { key: "AIA", count: 8 },
  ],
  now_type: [
    { key: "QIM", count: 15 },
    { key: "SAG", count: 12 },
    { key: "QCA", count: 8 },
  ],
  type: [
    { key: "mine", count: 50 },
    { key: "party", count: 75 },
    { key: "permit", count: 45 },
    { key: "permit_documents", count: 22 },
    { key: "mine_documents", count: 35 },
    { key: "explosives_permit", count: 28 },
    { key: "now_application", count: 38 },
    { key: "notice_of_departure", count: 20 },
  ],
};

export const SEARCH_OPTIONS = [
  { model_id: "mine", description: "Mines" },
  { model_id: "party", description: "Contacts" },
  { model_id: "permit", description: "Permits" },
  { model_id: "permit_documents", description: "Permit Documents" },
  { model_id: "mine_documents", description: "Mine Documents" },
  { model_id: "explosives_permit", description: "Explosives Permits" },
  { model_id: "now_application", description: "NoW Applications" },
  { model_id: "notice_of_departure", description: "Notices of Departure" },
];

export const SIMPLE_SEARCH_RESULTS = [
  {
    type: "mine",
    score: 10.0,
    result: {
      id: "mine-123",
      value: "Test Mine",
      description: "M-001",
      mine_guid: "test-mine-guid-1",
    },
  },
  {
    type: "person",
    score: 8.5,
    result: {
      id: "party-123",
      value: "John Doe",
      description: "john.doe@example.com | 555-1234",
      mine_guid: null,
    },
  },
  {
    type: "organization",
    score: 7.5,
    result: {
      id: "party-456",
      value: "ACME Corporation",
      description: "contact@acme.com",
      mine_guid: null,
    },
  },
  {
    type: "permit",
    score: 9.0,
    result: {
      id: "permit-789",
      value: "P-001",
      description: "John Doe | Status: O",
      mine_guid: "test-mine-guid-1",
    },
  },
];

export const SIMPLE_SEARCH_FACETS = {
  mine: 50,
  person: 45,
  organization: 30,
  permit: 45,
  nod: 20,
  explosives_permit: 28,
  now_application: 38,
};

export const EMPTY_SEARCH_RESULTS = {
  mine: [],
  party: [],
  permit: [],
  permit_documents: [],
  mine_documents: [],
  explosives_permit: [],
  now_application: [],
  notice_of_departure: [],
};

export const EMPTY_SEARCH_FACETS = {
  mine_region: [],
  mine_classification: [],
  mine_operation_status: [],
  mine_tenure: [],
  mine_commodity: [],
  has_tsf: [],
  verified_status: [],
  permit_status: [],
  party_type: [],
  type: [],
};

// Search parameters for testing
export const SEARCH_PARAMS = {
  basic: {
    search_term: "test",
  },
  withTypes: {
    search_term: "test",
    search_types: ["mine", "party"],
  },
  withFilters: {
    search_term: "test",
    mine_region: ["SW", "NE"],
    permit_status: ["O"],
  },
  withMultipleFilters: {
    search_term: "test mine",
    mine_region: ["SW"],
    mine_classification: ["Major Mine"],
    permit_status: ["O"],
    party_type: ["PER"],
  },
  empty: {
    search_term: "nonexistent",
  },
};

// URL query string examples
export const SEARCH_URLS = {
  basic: "?q=test",
  withTypes: "?q=test&search_types=mine,party",
  withFilters: "?q=test&mine_region=SW,NE&permit_status=O",
  withPagination: "?q=test&page=2",
  scoped: "?q=test&mine_guid=test-mine-guid-1",
};


export default {
  SEARCH_RESULTS_V2,
  SEARCH_FACETS,
  SEARCH_OPTIONS,
  SIMPLE_SEARCH_RESULTS,
  SIMPLE_SEARCH_FACETS,
  EMPTY_SEARCH_RESULTS,
  EMPTY_SEARCH_FACETS,
  SEARCH_PARAMS,
  SEARCH_URLS,
};
