import React from 'react';
import { shallow } from 'enzyme';
import MineTenureInfo from '@/components/mine/TenureTab/MineTenureInfo';
import * as MOCK from '@/tests/mocks/dataMocks';

const props = {}
const dispatchProps = {}

const setupDispatchProps = () => {
  dispatchProps.getMineRecordById = jest.fn();
  dispatchProps.updateMineRecord = jest.fn();
  dispatchProps.match = {};
};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe('MineTenureInfo', () => {
  it('renders properly', () => {
    const component = shallow(
    <MineTenureInfo 
      {...props} 
      {...dispatchProps}
      match={{ params: { id: 1 }, isExact: true, path: "", url: "" }}
      />
  );
    expect(component).toMatchSnapshot();
  });
});