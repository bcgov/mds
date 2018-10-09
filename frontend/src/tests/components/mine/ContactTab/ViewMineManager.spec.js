import React from 'react';
import { shallow } from 'enzyme';
import { ViewMineManager } from '@/components/mine/ContactTab/ViewMineManager';
import * as MOCK from '@/tests/mocks/dataMocks';

const dispatchProps = {};
const props = {}

const setupDispatchProps = () => {
  dispatchProps.toggleModal = jest.fn();
  dispatchProps.handleChange = jest.fn();
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.handlePartySubmit = jest.fn();
};

const setupProps = () => {
  props.modalVisible = false;
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  props.parties = MOCK.PARTY.parties;
  props.partyIds = MOCK.PARTY.partyIds;
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