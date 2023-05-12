import React from "react";
import { shallow } from "enzyme";
import { Provider } from "react-redux";
import { store } from "@/App";
import EditNoticeOfDepartureModal from "@/components/modalContent/noticeOfDeparture/EditNoticeOfDepartureModal";
import { NOTICE_OF_DEPARTURE_DETAILS, MINES } from "@/tests/mocks/dataMocks";

const dispatchProps: any = {};
const props: any = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.afterClose = jest.fn();
};

const setupProps = () => {
  // eslint-disable-next-line prefer-destructuring
  props.mineGuid = MINES.mineIds[0];
  props.initialValues = {};
  props.noticeOfDeparture = NOTICE_OF_DEPARTURE_DETAILS;
  props.addNoticeOfDepartureFormValues = {};
  props.onSubmit = jest.fn();
  props.closeModal = jest.fn();
  props.afterClose = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("EditNoticeOfDepartureModal", () => {
  it("renders properly", () => {
    const component = shallow(
      <Provider store={store}>
        <EditNoticeOfDepartureModal {...dispatchProps} {...props} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
