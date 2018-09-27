import React from 'react';
import { shallow } from 'enzyme';
import { ViewPermittee  } from '@/components/mine/ContactTab/ViewPermittee ';
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

describe('ViewPermittee', () => {
  it('renders properly', () => {
    const component = shallow(<ViewPermittee {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});