import React from 'react';
import { shallow } from 'enzyme';
import { ViewMineManager } from '@/components/mine/ContactTab/ViewMineManager';
import * as MOCK from '../../../mocks/dataMocks';

const dispatchProps = {};
const props = {}

const setupDispatchProps = () => {
  dispatchProps.getPersonnelById = jest.fn();
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

describe('ViewMineManager', () => {
  it('renders properly', () => {
    const component = shallow(<ViewMineManager {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});