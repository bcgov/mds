import React from "react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { render } from "@testing-library/react";
import { NOTICES_OF_DEPARTURE } from "@mds/common/constants/reducerTypes";
import { NOTICE_OF_DEPARTURE_DETAILS } from "@mds/common/tests/mocks/dataMocks";
import NoticeOfDepartureModal from "@/components/modalContent/NoticeOfDepartureModal";

const initialState = {
  [NOTICES_OF_DEPARTURE]: {
    noticeOfDeparture: NOTICE_OF_DEPARTURE_DETAILS
  }
};


describe("NoticeOfDepartureModal", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <NoticeOfDepartureModal />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
