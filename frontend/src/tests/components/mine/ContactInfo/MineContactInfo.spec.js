import React from 'react';
import { shallow } from 'enzyme';
import { MineContactInfo } from '@/components/mine/ContactInfo/MineContactInfo';
import * as MOCK from '@/tests/mocks/dataMocks';

const dispatchProps = {};
const reducerProps = {}

const setupDispatchProps = () => {
  dispatchProps.fetchParties = jest.fn();
  dispatchProps.createParty = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.addMineManager = jest.fn();
  dispatchProps.addPermittee = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  reducerProps.permittees = MOCK.PERMITTEE.permittees;
  reducerProps.permitteeIds = MOCK.PERMITTEE.permitteeIds;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe('MineContactInfo', () => {
  it('renders properly', () => {
    const component = shallow(<MineContactInfo {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});