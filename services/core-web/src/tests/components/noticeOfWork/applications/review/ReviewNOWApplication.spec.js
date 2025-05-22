import React from "react";
import { shallow } from "enzyme";
import { ReviewNOWApplication } from "@/components/noticeOfWork/applications/review/ReviewNOWApplication";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.noticeOfWork = NOW_MOCK.IMPORTED_NOTICE_OF_WORK;
  reducerProps.reclamationSummary = NOW_MOCK.RECLAMATION_SUMMARY;
  reducerProps.renderOriginalValues = jest.fn().mockReturnValue({ value: "N/A", edited: true });
  reducerProps.userRoles = { includes: () => { } };
};

beforeEach(() => {
  setupReducerProps();
});

// TypeError: Cannot read properties of undefined (reading 'blasting_operation')

//       37 |         id="blasting-operation"
//       38 |         title="Blasting"
//     > 39 |         data={props.noticeOfWork.blasting_operation}
//          |                                  ^
//       40 |         isViewMode={props.isViewMode}
//       41 |       >
//       42 |         <FormSection name="blasting_operation"></FormSection>
describe("ReviewNOWApplication", () => {
  it("renders properly", () => {
    const component = shallow(<ReviewNOWApplication {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
