import React from 'react';
import { shallow } from 'enzyme';
import RenderAutoComplete from '@/components/reusables/RenderAutoComplete';
import { MINE_NAME_LIST } from '../../mocks/dataMocks';


let props = {};

const setupProps = () => {
  props = {
    data: [],
    handleSearch: jest.fn(),
  };
}

beforeEach(() => {
  setupProps();
});

describe('RenderAutoComplete', () => {

  it('renders properly', () => {
    props.data = MINE_NAME_LIST;
    const wrapper = shallow(<RenderAutoComplete {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

});