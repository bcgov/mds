import React from 'react';
import { shallow } from 'enzyme';
import { UpdateMineManagerModal } from '@/components/modalContent/UpdateMineManagerModal';
import * as MOCK from '@/tests/mocks/dataMocks';

const dispatchProps = {};
const props = {}

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.handleChange = jest.fn();
  dispatchProps.handlePartySubmit = jest.fn();
};

const setupProps = () => {
  props.permit = MOCK.MINES.mines[MOCK.MINES.mineIds[1]].mine_permit
}

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe('UpdateMineManagerModal', () => {
  it('renders properly', () => {
    const component = shallow(<UpdateMineManagerModal {...dispatchProps} {...props}/>);
    expect(component).toMatchSnapshot();
  });
});