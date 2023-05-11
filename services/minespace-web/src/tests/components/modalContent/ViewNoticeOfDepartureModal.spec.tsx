import React from "react";
import { shallow } from "enzyme";
import * as MOCK from "@/tests/mocks/dataMocks";
import ViewNoticeOfDepartureModal from "@/components/modalContent/noticeOfDeparture/ViewNoticeOfDepartureModal";

const dispatchProps: any = {};
const props: any = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.afterClose = jest.fn();
};

const setupProps = () => {
  // eslint-disable-next-line prefer-destructuring
  props.noticeOfDeparture = MOCK.NOTICES_OF_DEPARTURE.records[0];
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
