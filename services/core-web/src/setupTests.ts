import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import path from "path";
import server from "@/tests/server";
import "@testing-library/jest-dom";

require("jest-localstorage-mock");

Enzyme.configure({ adapter: new Adapter() });

// eslint-disable-next-line @typescript-eslint/no-var-requires
(<any>global).REQUEST_HEADER = require(path.resolve(__dirname, "../common/utils/RequestHeaders.js"));


(<any>global).requestAnimationFrame = (callback: any) => {
  setTimeout(callback, 0); // eslint-disable-line @typescript-eslint/no-implied-eval
};

(<any>global).GLOBAL_ROUTES = {
  MINE_DASHBOARD: {
    route: "test",
    dynamicRoute: () => "test",
  },
};

beforeAll(() => {
  server.listen({ onUnhandledRequest: "warn" });
});

afterAll(() => {
  server.close();
});

jest.mock("@mds/common/providers/featureFlags/useFeatureFlag", () => ({
  useFeatureFlag: () => ({
    isFeatureEnabled: () => true,
  }),
}));

window.scrollTo = jest.fn();
const location = JSON.stringify(window.location);
delete window.location;

Object.defineProperty(window, "location", {
  value: JSON.parse(location),
});

Object.defineProperty(global.location, "href", {
  value: "http://localhost",
  configurable: true,
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
