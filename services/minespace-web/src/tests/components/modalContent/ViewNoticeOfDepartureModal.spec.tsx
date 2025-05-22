import React from "react";
import { render } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import ViewNoticeOfDepartureModal from "@/components/modalContent/noticeOfDeparture/ViewNoticeOfDepartureModal";

const dispatchProps: any = {};
const props: any = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.afterClose = jest.fn();
};

const setupProps = () => {
  props.noticeOfDeparture = MOCK.NOTICES_OF_DEPARTURE.records[0];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ViewNoticeOfDepartureModal", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ViewNoticeOfDepartureModal {...dispatchProps} {...props} />
    );
    expect(component).toMatchSnapshot();
  });
});
