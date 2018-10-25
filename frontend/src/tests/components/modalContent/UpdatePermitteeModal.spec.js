import React from 'react';
import { shallow } from 'enzyme';
import { UpdatePermitteeModal } from '@/components/modalContent/UpdatePermitteeModal';
import * as MOCK from '@/tests/mocks/dataMocks';

const dispatchProps = {};
const props = {}

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.handleChange = jest.fn();
  dispatchProps.handlePartySubmit = jest.fn();
};

const setupProps = () => {
  props.permit = MOCK.MINES.mines[MOCK.MINES.mineIds[1]].mine_permit[0];
  props.parties = MOCK.PARTY.parties;
  props.partyIds = MOCK.PARTY.partyIds;
  props.permittees = MOCK.PERMITTEE.permittees;
  props.permitteeIds = MOCK.PERMITTEE.permitteeIds;
}

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe('UpdatePermitteeModal', () => {
  it('renders properly', () => {
    const component = shallow(<UpdatePermitteeModal {...dispatchProps} {...props}/>);
    expect(component).toMatchSnapshot();
  });
});