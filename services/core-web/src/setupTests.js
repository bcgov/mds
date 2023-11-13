import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import path from "path";

require("jest-localstorage-mock");

global.REQUEST_HEADER = require(path.resolve(__dirname, "../common/utils/RequestHeaders.js"));

Enzyme.configure({ adapter: new Adapter() });

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
