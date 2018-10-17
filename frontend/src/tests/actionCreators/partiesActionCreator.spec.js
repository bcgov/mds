import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { createParty, fetchParties, fetchPartyById, addMineManager, addPermittee } from '@/actionCreators/partiesActionCreator';
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

describe('`createParty` action creator', () => {
  const mockPayload = {
    "first_name": 'mockName',
    "party_name": 'mockSurname'
  }
  const url = ENVIRONMENT.apiUrl + API.PARTY;
  it('Request successful, dispatches `success` with correct response', () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return (createParty(mockPayload)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it('Request failure, dispatches `error` with correct response', () => {
    mockAxios.onPost(url).reply(400, MOCK.ERROR);
    return (createParty(mockPayload)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe('`fetchParties` action creator', () => {
  const value = " ";
  const url = ENVIRONMENT.apiUrl + API.PARTIES(value);
  it('Request successful, dispatches `success` with correct response', () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(200, mockResponse);
    return (fetchParties(value)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it('Request failure, dispatches `error` with correct response', () => {
    mockAxios.onGet(url).reply(400, MOCK.ERROR);
    return (fetchParties(value)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe('`fetchPartyById` action creator', () => {
  const mockPayload = MOCK.PARTY.partyIds[0];
  const url = ENVIRONMENT.apiUrl + API.PARTY + "/" + mockPayload;
  it('Request successful, dispatches `success` with correct response', () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url, mockPayload).reply(200, mockResponse);
    return (fetchPartyById(mockPayload)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it('Request failure, dispatches `error` with correct response', () => {
    mockAxios.onGet(url).reply(400, MOCK.ERROR);
    return (fetchPartyById(mockPayload)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe('`addMineManager` action creator', () => {
  const mockPayload = {
    "mine_guid": MOCK.MINES.mineIds[0],
    "party_guid": MOCK.PARTY.partyIds[0], 
    "effective_date": '2018-10-10', 
    }
  const mineName = MOCK.MINES.mines[MOCK.MINES.mineIds[0]].mine_detail[0].mine_name;
  const url = ENVIRONMENT.apiUrl + API.MANAGER;
  it('Request successful, dispatches `success` with correct response', () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return (addMineManager(mockPayload.mine_guid, mockPayload.party_guid, mineName, mockPayload.effective_date)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it('Request failure, dispatches `error` with correct response', () => {
    mockAxios.onPost(url).reply(400, MOCK.ERROR);
    return (addMineManager(mockPayload, mineName)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe('`addPermittee` action creator', () => {
  const mockPayload = {
    "permittee_guid": MOCK.MINES.mines[MOCK.MINES.mineIds[1]].mine_permit[0].permittee[0].permittee_guid,
    "permit_guid": MOCK.MINES.mines[MOCK.MINES.mineIds[1]].mine_permit[0].permit_guid,
    "party_guid": MOCK.PARTY.partyIds[0], 
    "effective_date": '2018-10-10', 
    }
  const mineName = MOCK.MINES.mines[MOCK.MINES.mineIds[1]].mine_detail[0].mine_name;
  const url = ENVIRONMENT.apiUrl + API.PERMITTEE;
  it('Request successful, dispatches `success` with correct response', () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return (addPermittee(mockPayload.permittee_guid, mockPayload.permit_guid, mockPayload.party_guid, mineName, mockPayload.effective_date)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it('Request failure, dispatches `error` with correct response', () => {
    mockAxios.onPost(url).reply(400, MOCK.ERROR);
    return (addPermittee(mockPayload, mineName)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
