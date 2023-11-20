import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import path from "path";

require("jest-localstorage-mock");

Enzyme.configure({ adapter: new Adapter() });

// eslint-disable-next-line @typescript-eslint/no-var-requires
global.REQUEST_HEADER = require(path.resolve(__dirname, "../common/utils/RequestHeaders.js"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
global.ROUTES = require(path.resolve(__dirname, "./constants/routes.js"));

global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
};

const location = JSON.stringify(window.location);
delete window.location;

Object.defineProperty(window, "location", {
  value: JSON.parse(location),
});

Object.defineProperty(global.location, "href", {
  value: "http://localhost",
  configurable: true,
});
