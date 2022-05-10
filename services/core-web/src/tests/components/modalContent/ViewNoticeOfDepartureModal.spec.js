import React from "react";
import { shallow } from "enzyme";
import ViewNoticeOfDepartureModal from "@/components/modalContent/ViewNoticeOfDepartureModal";
import { NOTICE_OF_DEPARTURE_DETAILS } from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  // eslint-disable-next-line prefer-destructuring
  props.noticeOfDeparture = NOTICE_OF_DEPARTURE_DETAILS;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ViewNoticeOfDepartureModal", () => {
  it("renders properly", () => {
    const component = shallow(<ViewNoticeOfDepartureModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
