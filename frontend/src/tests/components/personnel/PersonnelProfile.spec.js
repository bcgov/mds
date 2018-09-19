import React from 'react';
import { shallow } from 'enzyme';
import { PersonnelProfile } from '@/components/personnel/PersonnelProfile';
import * as MOCK from '@/tests/mocks/dataMocks';

const dispatchProps = {};
const reducerProps = {}

const setupDispatchProps = () => {
  dispatchProps.getPersonnelById = jest.fn();
  dispatchProps.match = {};
};

const setupReducerProps = () => {
  reducerProps.personnel = MOCK.PERSONNEL.personnel[MOCK.PERSONNEL.personnelIds[0]];
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe('PersonnelProfile', () => {
  it('renders properly', () => {
    const component = shallow(
      <PersonnelProfile
        {...dispatchProps}
        {...reducerProps}
        match={{ params: { id: 1 }, isExact: true, path: "", url: "" }}
      />
    );
    expect(component).toMatchSnapshot();
  });
});