import React from 'react';
import { shallow } from 'enzyme';
import { ViewPermittee  } from '@/components/mine/ContactTab/ViewPermittee';
import * as MOCK from '@/tests/mocks/dataMocks';

const dispatchProps = {};
const props = {}

const setupDispatchProps = () => {
  dispatchProps.toggleModal = jest.fn();
  dispatchProps.handleSubmit= jest.fn();
  dispatchProps.handleChange = jest.fn();
  dispatchProps.handlePartySubmit = jest.fn();
  dispatchProps.togglePartyChange = jest.fn();
};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  props.permitteeModalVisible = false;
  props.isPerson = true;
  props.parties = MOCK.PARTY.parties;
  props.partyIds = MOCK.PARTY.partyIds;
  props.permittees = MOCK.MINES.mines[MOCK.MINES.mineIds[0]].mine_permit.permittees;
  props.permitteeIds = [];
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