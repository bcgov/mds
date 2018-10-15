import React from 'react';
import { shallow } from 'enzyme';
import MineHeader from '@/components/mine/MineHeader';
import * as MOCK from '@/tests/mocks/dataMocks';

const props = {}

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  props.handleMineUpdate = jest.fn();
  props.updateMineRecord = jest.fn();
  props.fetchMineRecordById = jest.fn();
  props.mineStatusOptions = MOCK.STATUS_OPTIONS.options;
};

beforeEach(() => {
  setupProps();
});

describe('MineHeader', () => {
  it('renders properly', () => {
    const component = shallow(<MineHeader {...props} />);
    expect(component).toMatchSnapshot();
  });
});