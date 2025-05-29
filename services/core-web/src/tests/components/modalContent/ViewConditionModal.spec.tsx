import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { ViewConditionModal } from "@/components/modalContent/ViewConditionModal";


describe("ViewConditionModal", () => {
  it("renders properly", () => {
    const { container } = render(<ReduxWrapper>
      <ViewConditionModal
        conditions={[]}
      />
    </ReduxWrapper>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
