import React from "react";
import { render } from "@testing-library/react";
import EditNoticeOfDepartureModal from "@/components/modalContent/noticeOfDeparture/EditNoticeOfDepartureModal";
import { NOTICE_OF_DEPARTURE_DETAILS, MINES } from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps: any = {
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
  afterClose: jest.fn(),
};
const props: any = {
  mineGuid: MINES.mineIds[0],
  initialValues: {},
  noticeOfDeparture: NOTICE_OF_DEPARTURE_DETAILS,
  addNoticeOfDepartureFormValues: {},
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
  afterClose: jest.fn(),
};

describe("EditNoticeOfDepartureModal", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <EditNoticeOfDepartureModal {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
