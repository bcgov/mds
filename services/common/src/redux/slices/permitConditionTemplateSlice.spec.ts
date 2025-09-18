import {
  postTemplateConditionToAmendment,
  default as permitConditionTemplateReducer,
  permitConditionTemplateReducerType,
} from "./permitConditionTemplateSlice";
import { configureStore } from "@reduxjs/toolkit";
import CustomAxios from "../customAxios";
import { notification } from "antd";

jest.mock("../customAxios");
jest.mock("antd", () => ({
  notification: {
    success: jest.fn(),
  },
}));

describe("permitConditionTemplateSlice", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        [permitConditionTemplateReducerType]: permitConditionTemplateReducer,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should post a template condition to amendment successfully", async () => {
    const params = {
      permitAmendmentGuid: "test-amendment-guid",
      standardPermitConditionGuid: "test-condition-guid",
    };

    const mockResponse = {
      message: "Permit conditions succesfully copied from standard permit conditions.",
    };
    (CustomAxios as jest.Mock).mockImplementation(() => ({
      post: jest.fn().mockResolvedValue({ data: mockResponse }),
    }));

    await store.dispatch(postTemplateConditionToAmendment(params));

    expect(notification.success).toHaveBeenCalledWith({
      message: "Successfully inserted template condition.",
      duration: 5,
    });
  });

  it("should handle errors when posting a template condition", async () => {
    const params = {
      permitAmendmentGuid: "test-amendment-guid",
      standardPermitConditionGuid: "test-condition-guid",
    };

    // Mock rejection
    const mockError = new Error(
      "Error"
    );
    (CustomAxios as jest.Mock).mockImplementation(() => ({
      post: jest.fn().mockRejectedValue(mockError),
    }));

    await store.dispatch(postTemplateConditionToAmendment(params));

    // Success notification should not be called on error
    expect(notification.success).not.toHaveBeenCalled();
  });
});
