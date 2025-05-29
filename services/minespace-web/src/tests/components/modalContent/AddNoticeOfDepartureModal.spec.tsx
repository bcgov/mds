import React from "react";
import { render } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import AddNoticeOfDepartureModal from "@/components/modalContent/noticeOfDeparture/AddNoticeOfDepartureModal";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

describe("AddNoticeOfDepartureModal", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <AddNoticeOfDepartureModal
          mineGuid={MOCK.MINES.mineIds[0]}
          permits={MOCK.PERMITS}
          onSubmit={jest.fn()}
        />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
