import React from "react";
import { render } from "@testing-library/react";
import { DecisionPackageTab } from "@/components/mine/Projects/DecisionPackageTab";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {};

const setupProps = () => {
  props.project = MOCK.MAJOR_PROJECTS_DASHBOARD.records[0];
  props.match = { params: { projectGuid: "1234-4567-xwqy" } };
  props.projectDecisionPackageStatusCodesHash = MOCK.PROJECT_SUMMARY_STATUS_CODES_HASH;
};

const setupDispatchProps = () => {
  props.fetchProjectById = jest.fn(() => Promise.resolve());
  props.isFeatureEnabled = (feature) => true
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      tab: "decision-package",
    }),
    useLocation: jest.fn().mockReturnValue({
      hash: "",
    }),
    useHistory: jest.fn().mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      location: { hash: "" },
    }),
  };
}
jest.mock("react-router-dom", () => mockFunction());

describe("DecisionPackageTab", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <DecisionPackageTab {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
