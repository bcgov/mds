import React from 'react';
import { shallow } from 'enzyme';
import { ViewPermittee  } from '@/components/mine/ContactInfo/ViewPermittee';
import * as MOCK from '@/tests/mocks/dataMocks';

const dispatchProps = {};
const props = {}

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.handleChange = jest.fn();
  dispatchProps.handlePartySubmit = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn();
  dispatchProps.fetchParties = jest.fn();
  dispatchProps.addPermittee = jest.fn();
};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  props.permittees = MOCK.PERMITTEE.permittees;
  props.permitteeIds = MOCK.PERMITTEE.permitteeIds;
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