import React from "react";
import { render } from "@testing-library/react";
import PermitConditionsNavigation from "@/components/admin/permitConditions/PermitConditionsNavigation";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const props = {
  activeButton: "sand-and-gravel",
  openSubMenuKey: [],
  userRoles: [],
};

describe("PermitConditionsNavigation", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={{}}>
        <PermitConditionsNavigation {...props} />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
