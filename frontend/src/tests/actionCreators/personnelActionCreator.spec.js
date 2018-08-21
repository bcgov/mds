import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { createPersonnel, getPersonnelList, getPersonnelById, addMineManager } from '../../actionCreators/personnelActionCreator';
import * as genericActions from '@/actions/genericActions';
import * as API from '@/constants/API';
import * as MOCK from '../mocks/dataMocks';
import { ENVIRONMENT } from '@/constants/environment'

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

describe('`createMinePersonnel` action creator', () => {
  const mockPayload = {
    "first_name": 'mockName',
    "surname": 'mockSurname'
  }
  const url = ENVIRONMENT.apiUrl + API.PERSON;
  it('Request successful, dispatches `success` with correct response', () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return (createPersonnel(mockPayload)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });

  it('Request failure, dispatches `error` with correct response', () => {
    const mockError = { errors: [], message: 'Error' };
    mockAxios.onPost(url, mockPayload, MOCK.createMockHeader()).reply(400, mockError);
    return (createPersonnel(mockPayload)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });
});

describe('`getPersonnelList` action creator', () => {
  const url = ENVIRONMENT.apiUrl + API.PERSONS;
  it('Request successful, dispatches `success` with correct response', () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(200, mockResponse);
    return (getPersonnelList()(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(3);
    });
  });

  it('Request failure, dispatches `error` with correct response', () => {
    const mockError = { errors: [], message: 'Error' };
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, mockError);
    return (getPersonnelList()(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });
});

describe('`getPersonnelById` action creator', () => {
  const mockPayload = MOCK.PERSONNEL.personnelIds[0];
  const url = ENVIRONMENT.apiUrl + API.PERSON + "/" + mockPayload;
  it('Request successful, dispatches `success` with correct response', () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url, mockPayload).reply(200, mockResponse);
    return (getPersonnelById(mockPayload)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(3);
    });
  });

  it('Request failure, dispatches `error` with correct response', () => {
    const mockError = { errors: [], message: 'Error' };
    mockAxios.onGet(url, mockPayload, MOCK.createMockHeader()).reply(400, mockError);
    return (getPersonnelById(mockPayload)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });
});

describe('`addMineManager` action creator', () => {
  const mockPayload = {
    "mine_guid": MOCK.MINES.mineIds[0],
    "person_guid": MOCK.PERSONNEL.personnelIds[0], 
    "effective_date": '2018-10-10', 
    }
  const mineName = MOCK.MINES.mines[MOCK.MINES.mineIds[0]].mine_detail[0].mine_name;
  const url = ENVIRONMENT.apiUrl + API.MANAGER;
  it('Request successful, dispatches `success` with correct response', () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return (addMineManager(mockPayload.mine_guid, mockPayload.person_guid, mineName, mockPayload.effective_date)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });

  it('Request failure, dispatches `error` with correct response', () => {
    const mockError = { errors: [], message: 'Error' };
    mockAxios.onPost(url, mockPayload, MOCK.createMockHeader()).reply(400, mockError);
    return (addMineManager(mockPayload, mineName)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });
});
