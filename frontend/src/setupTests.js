import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
require('jest-localstorage-mock');

Enzyme.configure({ adapter: new Adapter() });

global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
};
