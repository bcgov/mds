import React from "react";
import { shallow } from "enzyme";
import { DocumentTable } from "@/components/common/DocumentTable";
import * as MOCK from "@/tests/mocks/dataMocks";
import FeatureFlagContext from "@mds/common/providers/featureFlags/featureFlag.context";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.isViewOnly = true;
  props.documents = MOCK.VARIANCE.documents;
  props.documentCategoryOptionsHash = MOCK.VARIANCE_DOCUMENT_CATEGORY_OPTIONS_HASH;
  props.userInfo = { client_roles: ["mds_minespace_proponents"] };
};

const setupDispatchProps = () => {
  dispatchProps.removeDocument = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("DocumentTable", () => {
  it("renders properly", () => {
    const component = shallow(
      <FeatureFlagContext.Provider
        value={{
          isFeatureEnabled: () => true,
        }}
      >
        <DocumentTable {...props} {...dispatchProps} />
      </FeatureFlagContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
