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

import axios from "axios";
import { isFeatureEnabled } from "@mds/common/utils";
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

  describe("CustomAxios response interceptor", () => {
    beforeAll(() => {
      Object.defineProperty(window.location, "reload", {
        configurable: true,
        writable: true,
        value: jest.fn(),
      });
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    const getHandlers = (options?: any) => {
      CustomAxios(options);
      const [onFulfilled, onRejected] =
        mockResponseUse.mock.calls[mockResponseUse.mock.calls.length - 1];
      return { onFulfilled, onRejected };
    };

    describe("onFulfilled", () => {
      it("returns the response and does not notify when successToastMessage is undefined", () => {
        const successSpy = jest.spyOn(notification, "success");
        const { onFulfilled } = getHandlers();
        const response = { data: "ok" };

        const result = onFulfilled(response);

        expect(result).toBe(response);
        expect(successSpy).not.toHaveBeenCalled();
        successSpy.mockRestore();
      });

      it("shows a success notification when successToastMessage is provided", () => {
        const successSpy = jest.spyOn(notification, "success");
        const { onFulfilled } = getHandlers({ successToastMessage: "Saved successfully!" });
        const response = { data: "ok" };

        const result = onFulfilled(response);

        expect(result).toBe(response);
        expect(successSpy).toHaveBeenCalledWith({
          message: "Saved successfully!",
          duration: 10,
        });
        successSpy.mockRestore();
      });
    });

    describe("onRejected", () => {
      it("resolves the error message when request is cancelled", async () => {
        (axios.isCancel as unknown as jest.Mock).mockReturnValueOnce(true);
        const { onRejected } = getHandlers();
        const error = { message: "Request cancelled" } as any;

        const result = await onRejected(error);

        expect(result).toBe("Request cancelled");
      });

      it("reloads the page on 401 UNAUTHORIZED", async () => {
        const { onRejected } = getHandlers();
        const error = mockError({}, 401);

        await expect(onRejected(error)).rejects.toBe(error);
        expect(window.location.reload).toHaveBeenCalledWith(false);
      });

      it("reloads the page on 503 MAINTENANCE", async () => {
        const { onRejected } = getHandlers();
        const error = mockError({}, 503);

        await expect(onRejected(error)).rejects.toBe(error);
        expect(window.location.reload).toHaveBeenCalledWith(false);
      });

      it("shows a Tell Admin button that opens the report modal when REPORT_ERROR feature is enabled", async () => {
        const user = userEvent.setup();
        const { onRejected } = getHandlers();

        const error = mockError(
          {
            message: "Server exploded (psycopg2.OperationalError)",
            detailed_error: "Some detailed db trace",
            trace_id: "trace-500",
          },
          500
        );

        await expect(onRejected(error)).rejects.toBe(error);

        expect(await screen.findByText("Some detailed db trace")).toBeInTheDocument();
        expect(await screen.findByText("Trace Id: trace-500")).toBeInTheDocument();

        const tellAdminButton = await screen.findByRole("button", { name: "Tell Admin" });
        await user.click(tellAdminButton);

        expect(await screen.findByText("Report an error")).toBeInTheDocument();
      });

      it("shows standard error notification when REPORT_ERROR feature is disabled", async () => {
        (isFeatureEnabled as jest.Mock).mockReturnValueOnce(false);
        const errorSpy = jest.spyOn(notification, "error");
        const { onRejected } = getHandlers();

        const error = mockError({ message: "Simple failure" }, 500);

        await expect(onRejected(error)).rejects.toBe(error);

        expect(errorSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Simple failure",
            duration: 10,
          })
        );
        errorSpy.mockRestore();
      });

      it("shows custom errorToastMessage when provided", async () => {
        const errorSpy = jest.spyOn(notification, "error");
        const { onRejected } = getHandlers({ errorToastMessage: "Custom failure message" });

        const error = mockError({ message: "Backend error" }, 500);

        await expect(onRejected(error)).rejects.toBe(error);

        expect(errorSpy).toHaveBeenCalledWith({
          message: "Custom failure message",
          duration: 10,
        });
        errorSpy.mockRestore();
      });

      it("suppresses error notification when suppressErrorNotification is true", async () => {
        const errorSpy = jest.spyOn(notification, "error");
        const { onRejected } = getHandlers({ suppressErrorNotification: true });

        const error = mockError({ message: "Ignored error" }, 500);

        await expect(onRejected(error)).rejects.toBe(error);

        expect(errorSpy).not.toHaveBeenCalled();
        errorSpy.mockRestore();
      });

      it("handles error without response object", async () => {
        const errorSpy = jest.spyOn(notification, "error");
        const { onRejected } = getHandlers();
        const error = new Error("Network offline") as MDSError;

        await expect(onRejected(error)).rejects.toBe(error);
        expect(errorSpy).toHaveBeenCalled();
        errorSpy.mockRestore();
      });

      it("handles errorToastMessage being explicitly undefined", async () => {
        const errorSpy = jest.spyOn(notification, "error");
        const { onRejected } = getHandlers({ errorToastMessage: undefined });
        const error = mockError({ message: "Default fallback error" }, 500);

        await expect(onRejected(error)).rejects.toBe(error);
        expect(errorSpy).toHaveBeenCalled();
        errorSpy.mockRestore();
      });

      it("does not render detailed_error paragraph when detailed_error is 'Not provided'", async () => {
        const { onRejected } = getHandlers();
        const error = mockError(
          {
            message: "Some error",
            detailed_error: "Not provided",
          },
          500
        );

        await expect(onRejected(error)).rejects.toBe(error);
        expect(screen.queryByText("Not provided")).not.toBeInTheDocument();
      });

      it("rejects error without notification if document is not defined", async () => {
        const originalDoc = window.document;
        Object.defineProperty(window, "document", {
          configurable: true,
          value: null,
        });
        try {
          const { onRejected } = getHandlers();
          const error = mockError({}, 500);
          await expect(onRejected(error)).rejects.toBe(error);
        } finally {
          Object.defineProperty(window, "document", {
            configurable: true,
            value: originalDoc,
          });
        }
      });
    });

    describe("adapter configuration", () => {
      it("configures non-test adapters when NODE_ENV is production", () => {
        const originalEnv = process.env.NODE_ENV;
        try {
          process.env.NODE_ENV = "production";
          CustomAxios();
          expect(axios.create).toHaveBeenCalledWith({
            adapter: ["xhr", "http"],
          });
        } finally {
          process.env.NODE_ENV = originalEnv;
        }
      });
    });
  });
});
