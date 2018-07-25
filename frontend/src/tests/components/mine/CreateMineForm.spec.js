import React from 'react';
import { shallow } from 'enzyme';
import { CreateMineForm } from '../../../components/mine/CreateMineForm';

describe( 'CreateMineForm', () => {
  const component = shallow(<CreateMineForm />);

  it('renders properly', () => {
    expect(component).toMatchSnapshot();
  });

});