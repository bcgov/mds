import React from 'react';
import { shallow } from 'enzyme';
import { MapPin } from '@/components/maps/MapPin';
import * as MOCK from '@/tests/mocks/dataMocks';

const props = {};

const setupProps = () => {
  props.mineIds = MOCK.MINES.mineIds;
  props.mines = MOCK.MINES.mines;
};

beforeEach(() => {
  setupProps();
});

describe('MapPin', () => {
  it('renders properly', () => {
    const component = shallow(<MapPin {...props}/>);
    expect(component).toMatchSnapshot();
  });
});