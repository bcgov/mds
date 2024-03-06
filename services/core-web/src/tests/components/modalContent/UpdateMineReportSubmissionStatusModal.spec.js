import React from "react";
import { render, cleanup } from "@testing-library/react";
import UpdateMineReportSubmissionStatusModal from "@/components/modalContent/UpdateMineReportSubmissionStatusModal";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as MOCK from "@/tests/mocks/dataMocks";

describe("UpdateMineReportSubmissionStatusModal Component", () => {
  const initialState = {
    mine_report_submission_status_code: "INI",
  };

  afterEach(cleanup);

  test("renders UpdateMineReportSubmissionStatusModal component", () => {
    const { getByText } = render(
      <ReduxWrapper initialState={initialState}>
        <UpdateMineReportSubmissionStatusModal
          closeModal={() => {}}
          handleSubmit={() => {}}
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
      </ReduxWrapper>
    );
    const currentStatusLabel = getByText("Current status");
    expect(currentStatusLabel).toBeDefined();

    const currentStatusText = getByText("Received");
    expect(currentStatusText).toBeDefined();
  });
});
