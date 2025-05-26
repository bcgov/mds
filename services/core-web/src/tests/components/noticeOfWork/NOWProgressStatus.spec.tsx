import React from "react";
import { render } from "@testing-library/react";
import { NOWProgressStatus } from "@/components/noticeOfWork/NOWProgressStatus";

const reducerProps = {
  progressStatusHash: {},
  showProgress: true,
  progress: {},
  tab: "application",
  noticeOfWork: { notice_of_work_type_code: "PLA", application_type_code: "NOW" },
};

describe("NOWProgressStatus", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <NOWProgressStatus {...reducerProps} match={{ params: { id: 1 } }} />
    );
    expect(component).toMatchSnapshot();
  });
});
