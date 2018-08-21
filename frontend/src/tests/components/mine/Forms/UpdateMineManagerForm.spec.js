import React from 'react';
import { shallow } from 'enzyme';
import { UpdateMineManagerForm } from '@/components/mine/Forms/UpdateMineManagerForm';
import * as MOCK from '../../../mocks/dataMocks';

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
};

const setupProps = () => {
  props.personnel = MOCK.PERSONNEL.personnel;
  props.personnelIds = MOCK.PERSONNEL.personnelIds;
}

beforeEach(() => {
  setupDispatchProps();
});

describe('AddPersonnelFrom', () => {
  it('renders properly', () => {
    const component = shallow(<UpdateMineManagerForm {...dispatchProps} {...props}/>);
    expect(component).toMatchSnapshot();
  });
});