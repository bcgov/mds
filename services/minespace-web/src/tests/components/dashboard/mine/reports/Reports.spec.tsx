import React from "react";
import { render } from "@testing-library/react";
import { Reports } from "@/components/dashboard/mine/reports/Reports";
import * as MOCK from "@/tests/mocks/dataMocks";
import { store } from "@/App";
import { Provider } from "react-redux";
import FeatureFlagProvider from "@mds/common/providers/featureFlags/featureFlag.provider";
import { isFeatureEnabled } from "@mds/common/utils/featureFlag";

// Mock the isFeatureEnabled function
jest.mock("@mds/common/utils/featureFlag", () => ({
  isFeatureEnabled: jest.fn(),
  initializeFlagsmith: jest.fn(() => Promise.resolve()),
}));

const props: any = {};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
};

beforeEach(() => {
  setupProps();
});

describe("Reports", () => {
  it("renders properly", () => {
    (isFeatureEnabled as jest.Mock).mockImplementation(() => true);
    const { container } = render(
      <FeatureFlagProvider>
        <Provider store={store}>
          <Reports {...props} />
        </Provider>
      </FeatureFlagProvider>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
