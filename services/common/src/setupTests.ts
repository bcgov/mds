import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import path from "path";

require("jest-localstorage-mock");

Enzyme.configure({ adapter: new Adapter() });

// eslint-disable-next-line @typescript-eslint/no-var-requires
(<any>global).REQUEST_HEADER = require(path.resolve(__dirname, "./redux/utils/RequestHeaders.js"));

(<any>global).requestAnimationFrame = (callback: any) => {
  setTimeout(callback, 0); // eslint-disable-line @typescript-eslint/no-implied-eval
};

jest.mock("react-lottie", () => ({
  __esModule: true,
  default: "lottie-mock",
}));

jest.mock("@mds/common/providers/featureFlags/useFeatureFlag", () => ({
  useFeatureFlag: () => ({
    isFeatureEnabled: () => true,
  }),
}));

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
