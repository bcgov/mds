import React from 'react';
import { shallow } from 'enzyme';
import MineTenureInfo from '@/components/mine/TenureTab/MineTenureInfo';
import * as MOCK from '@/tests/mocks/dataMocks';

const props = {}

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
};

beforeEach(() => {
  setupProps();
});

describe('MineTenureInfo', () => {
  it('renders properly', () => {
    const component = shallow(
    <MineTenureInfo 
      {...props} 
      />
  );
    expect(component).toMatchSnapshot();
  });
});