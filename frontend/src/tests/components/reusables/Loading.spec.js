import React from 'react';
import { shallow } from 'enzyme';
import Loading from '@/components/reusables/Loading';

describe('Loading', () => {

  it('renders properly', () => {
    const wrapper = shallow(<Loading />);
    expect(wrapper).toMatchSnapshot();
  });

});
