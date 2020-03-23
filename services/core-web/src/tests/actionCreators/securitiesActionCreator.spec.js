/* eslint-disable */
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  fetchMineBonds,
  updateBond,
  createBond,
} from "@common/actionCreators/securitiesActionCreator";
import * as genericActions from "@common/actions/genericActions";
import { ENVIRONMENT } from "@common/constants/environment";
import * as API from "@common/constants/API";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatch = jest.fn();
const requestSpy = jest.spyOn(genericActions, "request");
const successSpy = jest.spyOn(genericActions, "success");
const errorSpy = jest.spyOn(genericActions, "error");
const mockAxios = new MockAdapter(axios);

beforeEach(() => {
  mockAxios.reset();
  dispatch.mockClear();
  requestSpy.mockClear();
  successSpy.mockClear();
  errorSpy.mockClear();
});

describe("`fetchMineBonds` action creator", () => {
  const mineGuid = "12345-6789";
  const url = ENVIRONMENT.apiUrl + API.MINE_BONDS(mineGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchMineBonds(mineGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(3);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url).reply(418, MOCK.ERROR);
    return fetchMineBonds(mineGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });
});

// describe("`createBond` action creator", () => {
//   const permitGuid = "12345-6789";
//   const payload = {};
//   const url = ENVIRONMENT.apiUrl + API.BOND();
//   it("Request successful, dispatches `success` with correct response", () => {
//     const mockResponse = { data: { success: true } };
//     mockAxios.onPost(url, payload).reply(200, mockResponse);
//     return createBond(
//       permitGuid,
//       payload
//     )(dispatch).then(() => {
//       expect(requestSpy).toHaveBeenCalledTimes(1);
//       expect(successSpy).toHaveBeenCalledTimes(1);
//       expect(dispatch).toHaveBeenCalledTimes(5);
//     });
//   });

//   it("Request failure, dispatches `error` with correct response", () => {
//     mockAxios.onPost(url).reply(418, MOCK.ERROR);
//     return createBond(permitGuid)(dispatch).then(() => {
//       expect(requestSpy).toHaveBeenCalledTimes(1);
//       expect(errorSpy).toHaveBeenCalledTimes(1);
//       expect(dispatch).toHaveBeenCalledTimes(4);
//     });
//   });
// });

// describe("`updateBond` action creator", () => {
//   const bondGuid = "53463";
//   const payload = {};
//   const url = ENVIRONMENT.apiUrl + API.BOND(bondGuid);
//   it("Request successful, dispatches `success` with correct response", () => {
//     const mockResponse = { data: { success: true } };
//     mockAxios.onPut(url, payload).reply(200, mockResponse);
//     return updateBond(
//       bondGuid,
//       payload
//     )(dispatch).then(() => {
//       expect(requestSpy).toHaveBeenCalledTimes(1);
//       expect(successSpy).toHaveBeenCalledTimes(1);
//       expect(dispatch).toHaveBeenCalledTimes(5);
//     });
//   });

//   it("Request failure, dispatches `error` with correct response", () => {
//     mockAxios.onPut(url).reply(418, MOCK.ERROR);
//     return updateBond(bondGuid)(dispatch).then(() => {
//       expect(requestSpy).toHaveBeenCalledTimes(1);
//       expect(errorSpy).toHaveBeenCalledTimes(1);
//       expect(dispatch).toHaveBeenCalledTimes(4);
//     });
//   });
// });
