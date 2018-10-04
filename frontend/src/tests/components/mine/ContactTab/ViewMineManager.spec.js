import React from 'react';
import { shallow } from 'enzyme';
import { ViewMineManager } from '@/components/mine/ContactTab/ViewMineManager';
import * as MOCK from '@/tests/mocks/dataMocks';

const dispatchProps = {};
const props = {}

const setupDispatchProps = () => {
  dispatchProps.fetchPartyById = jest.fn();
  dispatchProps.fetchParties = jest.fn();
  dispatchProps.createParty = jest.fn();
  dispatchProps.addMineManager = jest.fn();
  dispatchProps.getMineRecordById = jest.fn();
};

const setupProps = () => {
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