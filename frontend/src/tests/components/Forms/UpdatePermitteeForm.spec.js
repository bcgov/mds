import React from 'react';
import { shallow } from 'enzyme';
import { UpdatePermitteeForm } from '@/components/Forms/UpdatePermitteeForm';
import * as MOCK from '@/tests/mocks/dataMocks';

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.handleChange = jest.fn();
};

const setupProps = () => {
  props.parties = MOCK.PARTY.parties;
  props.partyIds = MOCK.PARTY.partyIds;
  props.permit = MOCK.MINES.mines[MOCK.MINES.mineIds[1]].mine_permit
}

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe('AddPartyFrom', () => {
  it('renders properly', () => {
    const component = shallow(<UpdatePermitteeForm {...dispatchProps} {...props}/>);
    expect(component).toMatchSnapshot();
  });
});