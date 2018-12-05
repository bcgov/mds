import React from 'react';
import { shallow } from 'enzyme';
import MapPopup from '@/components/maps/MapPopup';
import * as MOCK from '@/tests/mocks/dataMocks';

const props = {};

const setupProps = () => {
  props.mineIds = MOCK.MINES.mineIds;
  props.mines = MOCK.MINES.mines;
};

beforeEach(() => {
  setupProps();
});

describe('MapPopup', () => {
  it('renders properly', () => {
    const component = shallow(<MapPopup {...props} />);
    expect(component).toMatchSnapshot();
  });
});