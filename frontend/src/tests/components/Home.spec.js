import React from 'react';
import { shallow, mount } from 'enzyme';
import { Home } from '../../components/Home';

const dispatchProps = {};
let component;

const setupDispatchProps = () => {
  dispatchProps.createMineRecord = jest.fn();
};
  
  beforeEach(() => {
    setupDispatchProps();
  });
  
  describe('Home', () => {
    component = shallow(<Home  {...dispatchProps}/>);
    it('renders properly', () => {
      expect(component).toMatchSnapshot();
    });

});