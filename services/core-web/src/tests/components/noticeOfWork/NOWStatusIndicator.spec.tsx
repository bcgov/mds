import React from "react";
import { render } from "@testing-library/react";
import { NOWStatusIndicator } from "@/components/noticeOfWork/NOWStatusIndicator";

const reducerProps = {
  applicationDelay: {},
  progress: {},
  delayTypeOptionsHash: {},
  tabSection: "application",
  noticeOfWork: { notice_of_work_type_code: "PLA", application_type_code: "NOW" },
  isEditMode: false,
  type: "NOW",
};

describe("NOWStatusIndicator", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <NOWStatusIndicator {...reducerProps} match={{ params: { id: 1 } }} />
    );
    expect(component).toMatchSnapshot();
  });
});
