import React from 'react';
import { shallow } from 'enzyme';
import { MineTailingsInfo } from '@/components/mine/Tailings/MineTailingsInfo';
import * as MOCK from '@/tests/mocks/dataMocks';

const props = {}
const dispatchProps = {}; 

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  props.match = {};
  props.expectedDocumentStatusOptions =  MOCK.EXPECTED_DOCUMENT_STATUS_OPTIONS;
  props.mineTSFRequiredReports = MOCK.MINE_TSF_REQUIRED_REPORTS;
};

const setupDispatchProps = () => {
  dispatchProps.updateMineRecord = jest.fn();
  dispatchProps.createTailingsStorageFacility = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchExpectedDocumentStatusOptions = jest.fn();
  dispatchProps.fetchMineTailingsRequiredDocuments = jest.fn();

};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe('MineTailingsInfo', () => {
  it('renders properly', () => {
    const component = shallow(
    <MineTailingsInfo 
      {...props} 
      {...dispatchProps}
      />
  );
    expect(component).toMatchSnapshot();
  });
});