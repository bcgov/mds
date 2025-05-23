import React from "react";
import { render } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import ViewNoticeOfDepartureModal from "@/components/modalContent/noticeOfDeparture/ViewNoticeOfDepartureModal";

const dispatchProps: any = {
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
  afterClose: jest.fn(),
};
const props: any = {
  noticeOfDeparture: MOCK.NOTICES_OF_DEPARTURE.records[0],
};

describe("ViewNoticeOfDepartureModal", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ViewNoticeOfDepartureModal {...dispatchProps} {...props} />
    );
    expect(component).toMatchSnapshot();
  });
});
