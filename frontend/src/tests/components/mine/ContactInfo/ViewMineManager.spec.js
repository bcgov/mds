import React from 'react';
import { shallow } from 'enzyme';
import { ViewMineManager } from '@/components/mine/ContactInfo/ViewMineManager';
import * as MOCK from '@/tests/mocks/dataMocks';

const dispatchProps = {};
const props = {}

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.handleChange = jest.fn();
  dispatchProps.addMineManager = jest.fn();
  dispatchProps.handlePartySubmit = jest.fn();
  dispatchProps.fetchMineRecordById= jest.fn();
};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe('ViewMineManager', () => {
  it('renders properly', () => {
    const component = shallow(<ViewMineManager {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});