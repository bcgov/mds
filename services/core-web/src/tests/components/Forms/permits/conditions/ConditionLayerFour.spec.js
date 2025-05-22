import React from "react";
import { render } from "@testing-library/react";
import { ConditionLayerFour } from "@/components/Forms/permits/conditions/ConditionLayerFour";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import * as MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.handleCancel = jest.fn();
  dispatchProps.handleDelete = jest.fn();
  dispatchProps.reorderConditions = jest.fn();
  dispatchProps.setConditionEditingFlag = jest.fn();
};

const setupProps = () => {
  props.condition = { sub_conditions: [] };
  props.new = false;
  props.initialValues = {};
  props.editingConditionFlag = true;
  props.isViewOnly = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      mine_guid: "mine-guid",
      permit_guid: "permit-guid",
      id: "id-param",
      type: "type-param"
    }),
    useLocation: jest.fn()
  };
}

jest.mock("react-router-dom", () => mockFunction());

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: MOCK.IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
}

// TypeError: Cannot read properties of undefined (reading 'match')

//       47 |   const [isEditing, setIsEditing] = useState(false);
//       48 |   const [conditionType, setConditionType] = useState("SEC");
//     > 49 |   const params = useParams<{ mine_guid?: string, permit_guid?: string, id?: string, type?: string }>();
//          |                           ^
//       50 |   const location = useLocation();
//       51 |
//       52 |   const handleSubmit = (values) => {
describe("ConditionLayerFour", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper initialState={initialState}><ConditionLayerFour {...dispatchProps} {...props} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
