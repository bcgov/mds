import React from 'react';
import { shallow } from 'enzyme';
import { ViewPermittee  } from '@/components/mine/ContactTab/ViewPermittee ';
import * as MOCK from '@/tests/mocks/dataMocks';

const dispatchProps = {};
const props = {}

const setupDispatchProps = () => {
  dispatchProps.getPersonnelById = jest.fn();
  dispatchProps.getPersonnelList = jest.fn();
  dispatchProps.createPersonnel = jest.fn();
  dispatchProps.addMineManager = jest.fn();
  dispatchProps.getMineRecordById = jest.fn();
};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  props.personnel = MOCK.PERSONNEL.personnel;
  props.personnelIds = MOCK.PERSONNEL.personnelIds;
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