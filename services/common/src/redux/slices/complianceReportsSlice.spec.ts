import { configureStore } from "@reduxjs/toolkit";
import { notification } from "antd";
import CustomAxios from "@mds/common/redux/customAxios";
import complianceReportReducer, {
  createMineReportDefinition,
  fetchComplianceReports,
  fetchMineReportDueDateTypes,
} from "./complianceReportsSlice";
import {
  hideLoadingMock,
  showLoadingMock,
} from "@mds/common/redux/slices/mineReportPermitRequirementSlice.spec";

// Mocks
jest.mock("@mds/common/redux/customAxios");
jest.mock("react-redux-loading-bar", () => ({
  showLoading: () => showLoadingMock,
  hideLoading: () => hideLoadingMock,
}));
jest.mock("@mds/common/redux/customAxios");

jest.mock("react-redux-loading-bar", () => ({
  showLoading: () => showLoadingMock,
  hideLoading: () => hideLoadingMock,
}));
jest.mock("antd", () => ({
  notification: {
    success: jest.fn(),
  },
}));

describe("complianceReportsSlice", () => {
  let store;

  // Mock responses
  const mockComplianceReports = {
    data: {
      records: [
        {
          mine_report_definition_guid: "guid1",
          report_name: "Report 1",
          description: "Description for Report 1",
          mine_report_due_date_type: "Type1",
          is_common: false,
          is_prr_only: true,
          active_ind: true,
          default_due_date: "2024-12-31",
        },
        {
          mine_report_definition_guid: "guid2",
          report_name: "Report 2",
          description: "Description for Report 2",
          mine_report_due_date_type: "Type2",
          is_common: true,
          is_prr_only: false,
          active_ind: false,
          default_due_date: "2025-01-01",
        },
      ],
      current_page: 1,
      items_per_page: 10,
      total: 2,
      total_pages: 1,
    },
  };

  const mockDueDateTypes = {
    data: [
      { mine_report_due_date_type: "TypeA", description: "Type A Description" },
      { mine_report_due_date_type: "TypeB", description: "Type B Description" },
    ],
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        complianceCodes: complianceReportReducer,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchComplianceReports", () => {
    it("should fetch compliance reports successfully", async () => {
      // Mock implementation for the API call
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: jest.fn().mockResolvedValue(mockComplianceReports),
      }));

      const searchParams = { per_page: 10 };
      await store.dispatch(fetchComplianceReports(searchParams));

      const state = store.getState().complianceCodes;

      expect(state.reportPageData.records.length).toBe(2);
      expect(state.reportPageData).toEqual({
        ...mockComplianceReports.data,
      });
      expect(state.params).toEqual(searchParams);
    });
  });

  describe("createMineReportDefinition", () => {
    const mockReportDefinition = {
      data: {
        mine_report_definition_guid: "new_guid",
        report_name: "New Report",
        description: "New Report Description",
        mine_report_due_date_type: "ANV",
        default_due_date: "2026-01-01",
        is_common: true,
        is_prr_only: false,
        active_ind: true,
      },
    };

    it("should successfully create a compliance report definition", async () => {
      // (CustomAxios as jest.Mock).mockResolvedValue({ data: mockReportDefinition });
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        post: jest.fn().mockResolvedValue(mockReportDefinition),
      }));

      const payload = {
        report_name: "New Report",
        description: "New Report Description",
        mine_report_due_date_type_code: "ANV",
        is_common: true,
        is_prr_only: false,
      };

      await store.dispatch(createMineReportDefinition(payload));

      const state = store.getState().complianceCodes;

      expect(state.reportPageData.records[0]).toMatchObject(mockReportDefinition.data);
      expect(notification.success).toHaveBeenCalledWith({
        message: "Successfully create new report definition",
        duration: 10,
      });
    });
  });

  describe("fetchMineReportDueDateTypes", () => {
    it("should fetch mine report due date types successfully", async () => {
      // Mock implementation for `get`
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: jest.fn().mockResolvedValue(mockDueDateTypes),
      }));

      await store.dispatch(fetchMineReportDueDateTypes({}));

      const state = store.getState().complianceCodes;

      expect(state.dueDateTypes).toEqual(mockDueDateTypes.data);
    });
  });
});
