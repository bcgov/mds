import React from "react";
import { shallow } from "enzyme";
import * as Mock from "@/tests/mocks/dataMocks";
import ViewNoticeOfDepartureModal from "@/components/modalContent/ViewNoticeOfDepartureModal";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  // eslint-disable-next-line prefer-destructuring
  props.noticeOfDeparture = Mock.NOTICES_OF_DEPARTURE.records[0];
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
