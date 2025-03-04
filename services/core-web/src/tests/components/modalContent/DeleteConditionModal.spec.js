import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { DeleteConditionModal } from "@/components/modalContent/DeleteConditionModal";
import { PERMITS } from "@mds/common/tests/mocks/dataMocks";

describe("DeleteConditionModal", () => {
  it("renders properly", () => {
    const { container } = render(<ReduxWrapper>
      <DeleteConditionModal
        deleteCondition={jest.fn()}
        title="mockTitle"
        condition={PERMITS[0].permit_amendments[0].conditions[0]}
        submitting={false}
      />
    </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
