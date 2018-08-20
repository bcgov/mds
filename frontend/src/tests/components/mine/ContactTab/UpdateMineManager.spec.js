import React from 'react';
import { shallow } from 'enzyme';
import { UpdateMineManager } from '@/components/mine/ContactTab/UpdateMineManager';
import * as MOCK from '../../../mocks/dataMocks';

const dispatchProps = {};
const props = {}

const setupDispatchProps = () => {
  dispatchProps.getPersonnelList = jest.fn();
  dispatchProps.createPersonnel = jest.fn();
  dispatchProps.addMineManager = jest.fn();
  dispatchProps.getMineRecord = jest.fn();
  dispatchProps.handleManagerUpdate = jest.fn();
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

describe('UpdateMineManager', () => {
  it('renders properly', () => {
    const component = shallow(<UpdateMineManager {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});