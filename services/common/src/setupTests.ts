import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import path from "path";

require("jest-localstorage-mock");

Enzyme.configure({ adapter: new Adapter() });

// eslint-disable-next-line @typescript-eslint/no-var-requires
(<any>global).REQUEST_HEADER = require(path.resolve(__dirname, "./redux/utils/RequestHeaders.tsx"));

(<any>global).requestAnimationFrame = (callback: any) => {
  setTimeout(callback, 0); // eslint-disable-line @typescript-eslint/no-implied-eval
};

(<any>global).GLOBAL_ROUTES = {
  EDIT_PROJECT: {
    route: "test",
    dynamicRoute: () => "test",
  },
};

jest.mock("react", () => {
  const original = jest.requireActual("react");
  return {
    ...original,
    useLayoutEffect: jest.fn(),
  };
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

// for leaflet, emaulate SVG support. jest has an open PR for SVG support but it's been 3 years
const createElementNSOrig = global.document.createElementNS;
global.document.createElementNS = function (namespaceURI, qualifiedName) {
  if (namespaceURI === "http://www.w3.org/2000/svg" && qualifiedName === "svg") {
    // eslint-disable-next-line prefer-rest-params
    const element = createElementNSOrig.apply(this, arguments);
    element.createSVGRect = function () {};
    return element;
  }
  // eslint-disable-next-line prefer-rest-params
  return createElementNSOrig.apply(this, arguments);
};
