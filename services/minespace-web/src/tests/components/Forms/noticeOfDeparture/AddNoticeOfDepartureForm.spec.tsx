import React from "react";
import { render } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import AddNoticeOfDepartureForm from "@/components/Forms/noticeOfDeparture/AddNoticeOfDepartureForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

describe("AddNoticeOfDepartureForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <AddNoticeOfDepartureForm
          mineGuid={MOCK.MINES.mineIds[0]}
          permits={MOCK.PERMITS.map((p) => ({ ...p, amendments: [] }))}
          onSubmit={jest.fn()}
        />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
