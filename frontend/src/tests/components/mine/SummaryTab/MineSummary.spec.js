import React from 'react';
import { shallow } from 'enzyme';
import MineSummary from '@/components/mine/SummaryTab/MineSummary';
import * as MOCK from '@/tests/mocks/dataMocks';

const props = {}

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
};

beforeEach(() => {
  setupProps();
});

describe('MineSummary', () => {
  it('renders properly', () => {
    const component = shallow(<MineSummary {...props} />);
    expect(component).toMatchSnapshot();
  });
});