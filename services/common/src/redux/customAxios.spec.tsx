import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { notification } from "antd";

window.scrollTo = jest.fn();

const mockPost = jest.fn().mockResolvedValue({ data: {} });

const mockResponseUse = jest.fn();

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      post: mockPost,
      interceptors: { response: { use: mockResponseUse } },
    })),
    isCancel: jest.fn(() => false),
  },
}));

jest.mock("@mds/common/utils", () => ({
  ...jest.requireActual("@mds/common/utils"),
  isFeatureEnabled: jest.fn(() => true),
}));

import CustomAxios, { notifymAdmin, openReportErrorModal, MDSError } from "./customAxios";

const mockError = (data: object, status?: number): MDSError =>
  ({ response: { data, status } } as MDSError);

describe("customAxios report-error helpers", () => {
  beforeEach(() => {
    mockPost.mockClear();
  });

  describe("notifymAdmin", () => {
    it("posts the business error, trace id, and additional details", () => {
      const error = mockError({ message: "Something broke", trace_id: "trace-123" });

      notifymAdmin(error, { severity: "High", description: "It broke", seenBefore: true });

      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining("/report-error"),
        {
          business_error: "Something broke",
          trace_id: "trace-123",
          severity: "High",
          description: "It broke",
          seen_before: true,
        },
        expect.anything()
      );
    });

    it("shows a success notification once the report is sent", async () => {
      const successSpy = jest.spyOn(notification, "success");
      const error = mockError({ message: "Oops", trace_id: "trace-1" });

      notifymAdmin(error, { severity: "Low", description: "desc" });

      await waitFor(() => expect(successSpy).toHaveBeenCalled());
      successSpy.mockRestore();
    });

    it("shows an error notification when sending the report fails", async () => {
      const errorSpy = jest.spyOn(notification, "error");
      mockPost.mockRejectedValueOnce(new Error("Network Error"));
      const error = mockError({ message: "Oops", trace_id: "trace-1" });

      notifymAdmin(error, { severity: "Low", description: "desc" });

      await waitFor(() => expect(errorSpy).toHaveBeenCalled());
      errorSpy.mockRestore();
    });
  });

  describe("openReportErrorModal", () => {
    it("mounts the modal, submits via notifymAdmin, and cleans up", async () => {
      const user = userEvent.setup();
      const error = mockError({ message: "Boom", trace_id: "trace-999" });

      openReportErrorModal(error);

      expect(await screen.findByText("Report an error")).toBeInTheDocument();

      await user.type(
        screen.getByPlaceholderText("Describe what you were doing when this happened"),
        "Reproduced by clicking submit twice"
      );
      await user.click(screen.getByRole("button", { name: "Send" }));

      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining("/report-error"),
        expect.objectContaining({
          business_error: "Boom",
          trace_id: "trace-999",
          description: "Reproduced by clicking submit twice",
        }),
        expect.anything()
      );

      await waitFor(() => expect(screen.queryByText("Report an error")).not.toBeInTheDocument());
    });

    it("unmounts the modal on cancel without submitting", async () => {
      const user = userEvent.setup();
      const error = mockError({ message: "Boom", trace_id: "trace-1" });

      openReportErrorModal(error);

      expect(await screen.findByText("Report an error")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Cancel" }));

      await waitFor(() => expect(screen.queryByText("Report an error")).not.toBeInTheDocument());
      expect(mockPost).not.toHaveBeenCalled();
    });
  });

  describe("error response interceptor", () => {
    const getRejectedHandler = () => {
      CustomAxios();
      const [, onRejected] = mockResponseUse.mock.calls[mockResponseUse.mock.calls.length - 1];
      return onRejected;
    };

    it("shows a Tell Admin button that opens the report modal", async () => {
      const user = userEvent.setup();
      const onRejected = getRejectedHandler();

      const error = mockError({ message: "Server exploded", trace_id: "trace-500" }, 500);

      await expect(onRejected(error)).rejects.toBe(error);

      const tellAdminButton = await screen.findByRole("button", { name: "Tell Admin" });
      await user.click(tellAdminButton);

      expect(await screen.findByText("Report an error")).toBeInTheDocument();
    });
  });
});
