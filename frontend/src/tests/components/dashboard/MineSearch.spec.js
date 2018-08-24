import React from 'react';
import { shallow } from 'enzyme';
import MineSearch from '@/components/dashboard/MineSearch';
import * as MOCK from '@/tests/mocks/dataMocks';

const props = {};

const setupProps = () => {
  props.mineNameList = MOCK.MINE_NAME_LIST
};

beforeEach(() => {
  setupProps();
});

describe('MineSearch', () => {
  it('renders properly', () => {
    const component = shallow(<MineSearch {...props} />);
    expect(component).toMatchSnapshot();
  });
});