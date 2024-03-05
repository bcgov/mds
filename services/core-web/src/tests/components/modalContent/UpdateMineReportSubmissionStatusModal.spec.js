import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import UpdateMineReportSubmissionStatusModal from "@/components/modalContent/UpdateMineReportSubmissionStatusModal";
import * as MOCK from "@/tests/mocks/dataMocks";
import { reduxForm, reducer as formReducer } from "redux-form";

const mockStore = configureStore({
  form: formReducer,
});

const WrappedUpdateMineReportSubmissionModal = reduxForm({
  form: "UPDATE_MINE_REPORT_SUBMISSION_STATUS",
})(UpdateMineReportSubmissionStatusModal);

describe("UpdateMineReportSubmissionStatusModal Component", () => {
  let store;

  test("renders UpdateMineReportSubmissionStatusModal component", () => {
    store = mockStore({
      form: {
        UPDATE_MINE_REPORT_SUBMISSION_STATUS: {
          values: {
            mine_report_submission_status_code: "INI",
          },
        },
      },
    });
    const { getByText } = render(
      <Provider store={store}>
        <WrappedUpdateMineReportSubmissionModal
          currentStatus={"Received"}
          latestSubmission={{
            create_user: "testUser",
            update_user: "testUser",
            mine_report_submission_guid: "abcde123",
            create_timestamp: "2023-04-10 22:35:20.000",
            update_timestamp: "2023-04-10 22:35:20.000",
          }}
          mineReportStatusOptions={MOCK.BULK_STATIC_CONTENT_RESPONSE.mineReportStatusOptions}
        />
      </Provider>
    );

    const currentStatusText = getByText("Current status");
    expect(currentStatusText).toBeDefined();
  });
});
