import React from 'react';
import { shallow } from 'enzyme';
import MineTenureInfo from '@/components/mine/Tenure/MineTenureInfo';
import * as MOCK from '@/tests/mocks/dataMocks';

const props = {}
const dispatchProps = {}

const setupDispatchProps = () => {
  dispatchProps.fetchMineRecordById = jest.fn();
  dispatchProps.updateMineRecord = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.match = {};
};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe('MineTenureInfo', () => {
  it('renders properly', () => {
    const component = shallow(
      <MineTenureInfo 
        {...dispatchProps}
        {...props} 
        match={{ params: { id: 1 }, isExact: true, path: "", url: "" }}
      />
  );
    expect(component).toMatchSnapshot();
  });
});