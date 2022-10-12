import { shallow } from "enzyme";
import { store } from "@/App";

let props = {};
let dispatchProps = {};

const setupProps = () => {
  props = {
    tsf:
      MOCK.MINES.mines["18133c75-49ad-4101-85f3-a43e35ae989a"].mine_tailings_storage_facilities[0],
    initialValues: {},
    formValues: {},
    formErrors: {},
  };
};

const setupDispatchProps = () => {
  dispatchProps = {
    storeTsfs: jest.fn(),
    storeDam: jest.fn(),
    fetchMineRecordById: jest.fn(),
    fetchDam: jest.fn(),
  };
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("DamsPage", () => {
  it("renders properly", () => {
    const component = shallow(
      <Provider store={store}>
        <DamsPage {...props} {...dispatchProps} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
