import React from 'react';
import { shallow } from 'enzyme';
import { AddTailingsReportForm } from '@/components/Forms/AddTailingsReportForm';

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.title = 'mockTitle';
  props.mineTSFRequiredReports = []
}

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe('AddTailingsReportForm', () => {
  it('renders properly', () => {
    const component = shallow(<AddTailingsReportForm {...dispatchProps} {...props}/>);
    expect(component).toMatchSnapshot();
  });
});