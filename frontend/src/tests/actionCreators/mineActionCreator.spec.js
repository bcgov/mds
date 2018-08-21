import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { createMineRecord, updateMineRecord, getMineRecords, getMineRecordById } from '../../actionCreators/mineActionCreator';
import * as genericActions from '../../actions/genericActions';
import * as API from '../../constants/API';
import * as MOCK from '../mocks/dataMocks';
import { ENVIRONMENT } from '../../constants/environment'

const dispatch = jest.fn();
const requestSpy = jest.spyOn(genericActions, 'request');
const successSpy = jest.spyOn(genericActions, 'success');
const errorSpy = jest.spyOn(genericActions, 'error');
const mockAxios = new MockAdapter(axios);

beforeEach(() => {
  mockAxios.reset();
  dispatch.mockClear();
  requestSpy.mockClear();
  successSpy.mockClear();
  errorSpy.mockClear();
});

describe('`createMineRecord` action creator', () => {
  const mineName = "mock Mine"
  const url = ENVIRONMENT.apiUrl + API.MINE;
  const mockPayLoad = { "name": mineName }
  it('Request successful, dispatches `success` with correct response', () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayLoad).reply(200, mockResponse);
    return (createMineRecord(mineName)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });

  it('Request failure, dispatches `error` with correct response', () => {
    const mockError = { errors: [], message: 'Error' };
    mockAxios.onPost(url, mockPayLoad, MOCK.createMockHeader()).reply(400, mockError);
    return (createMineRecord(mineName)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });
});

describe('`updateMineRecord` action creator', () => {
  const mineId = "1"
  const tenureNumber = "0293847"
  const mineName = "MockMine"
  const url = ENVIRONMENT.apiUrl + API.MINE + "/" + mineId;
  const mockPayLoad = { "tenure_number_id": tenureNumber }
  it('Request successful, dispatches `success` with correct response', () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, mockPayLoad).reply(200, mockResponse);
    return (updateMineRecord(mineId, tenureNumber, mineName)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });

  it('Request failure, dispatches `error` with correct response', () => {
    const mockError = { errors: [], message: 'Error' };
    mockAxios.onPut(url, mockPayLoad, MOCK.createMockHeader()).reply(400, mockError);
    return (updateMineRecord(mineId, tenureNumber)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });
});

describe('`getMineRecords` action creator', () => {
  const url = ENVIRONMENT.apiUrl + API.MINE_LIST;
  it('Request successful, dispatches `success` with correct response', () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return (getMineRecords()(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(3);
    });
  });

  it('Request failure, dispatches `error` with correct response', () => {
    const mockError = { errors: [], message: 'Error' };
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, mockError);
    return (getMineRecords()(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });
});

describe('`getMineRecordById` action creator', () => {
  const mineId = "2"
  const url = ENVIRONMENT.apiUrl + API.MINE + "/" + mineId;
  it('Request successful, dispatches `success` with correct response', () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return (getMineRecordById(mineId)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(3);
    });
  });

  it('Request failure, dispatches `error` with correct response', () => {
    const mockError = { errors: [], message: 'Error' };
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, mockError);
    return (getMineRecordById(mineId)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });
});

