import React from "react";
import { shallow } from "enzyme";
import { ReviewActivities } from "@/components/noticeOfWork/applications/review/ReviewActivities";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.noticeOfWork = NOW_MOCK.IMPORTED_NOTICE_OF_WORK;
  reducerProps.noticeOfWorkType = "COL";
  reducerProps.renderOriginalValues = jest.fn().mockReturnValue({ value: "N/A", edited: true });
};

beforeEach(() => {
  setupReducerProps();
});

// TypeError: Cannot read properties of undefined (reading 'camp')

//       346 | export default connect(
//       347 |   (state) => ({
//     > 348 |     campFormValues: getFormValues(FORM.EDIT_NOTICE_OF_WORK)(state).camp || {},
//           |                                                                   ^
//       349 |   }),
//       350 |   null
//       351 | )(Camps);
describe("ReviewActivities", () => {
  it("renders properly", () => {
    const component = shallow(<ReviewActivities {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
