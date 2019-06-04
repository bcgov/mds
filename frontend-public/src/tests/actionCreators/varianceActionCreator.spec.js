import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  createVariance,
  fetchVariancesByMine,
  updateVariance,
  addDocumentToVariance,
  removeDocumentFromVariance,
  fetchVarianceById,
  fetchMineComplianceCodes,
  fetchVarianceStatusOptions,
} from "@/actionCreators/varianceActionCreator";
import * as genericActions from "@/actions/genericActions";
import * as API from "@/constants/API";
import * as MOCK from "@/tests/mocks/dataMocks";
import { ENVIRONMENT } from "@/constants/environment";

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

describe("`createVariance` action creator", () => {
  const mineGuid = "1234567";
  const mockPayload = {
    effective_date: "1970-01-01",
    expiry_date: "2025-12-31",
  };
  const mineName = "mockMineName";
  const url = ENVIRONMENT.apiUrl + API.VARIANCES(mineGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url).reply(200, mockResponse);
    return createVariance({ mineGuid, mineName }, mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(400, MOCK.ERROR);
    return createVariance({ mineGuid, mineName }, mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchVariancesByMine` action creator", () => {
  const mineGuid = "1234567";
  const url = ENVIRONMENT.apiUrl + API.VARIANCES(mineGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };

    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchVariancesByMine({ mineGuid })(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, MOCK.ERROR);
    return fetchVariancesByMine({ mineGuid })(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchVarianceById` action creator", () => {
  const mineGuid = "1234567";
  const varianceGuid = "4658274";
  const url = ENVIRONMENT.apiUrl + API.VARIANCE(mineGuid, varianceGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };

    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchVarianceById({ mineGuid, varianceGuid })(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, MOCK.ERROR);
    return fetchVarianceById({ mineGuid, varianceGuid })(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateVariance` action creator", () => {
  const mineGuid = "1234567";
  const mockPayload = {
    effective_date: "1970-01-01",
    expiry_date: "9999-12-31",
  };
  const varianceGuid = "23448594";
  const codeLabel = "mockCodeLabel";
  const url = ENVIRONMENT.apiUrl + API.VARIANCE(mineGuid, varianceGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url).reply(200, mockResponse);
    return updateVariance({ mineGuid, varianceGuid, codeLabel }, mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(400, MOCK.ERROR);
    return updateVariance({ mineGuid, varianceGuid, codeLabel }, mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`addDocumentToVariance` action creator", () => {
  const mineGuid = "1234567";
  const mockPayload = {
    document_manager_guid: "f6737c4f-2cf2-4efb-923a-3e010f8737c5",
    document_name: "test.pdf",
  };
  const varianceGuid = "23448594";
  const url = ENVIRONMENT.apiUrl + API.VARIANCE_DOCUMENTS(mineGuid, varianceGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url).reply(200, mockResponse);
    return addDocumentToVariance({ mineGuid, varianceGuid }, mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(400, MOCK.ERROR);
    return addDocumentToVariance({ mineGuid, varianceGuid }, mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`removeDocumentFromVariance` action creator", () => {
  const mineGuid = "1234567";
  const varianceGuid = "23448594";
  const mineDocumentGuid = "123o5981437";
  const url = ENVIRONMENT.apiUrl + API.VARIANCE_DOCUMENT(mineGuid, varianceGuid, mineDocumentGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(200, mockResponse);
    return removeDocumentFromVariance({ mineGuid, varianceGuid, mineDocumentGuid })(dispatch).then(
      () => {
        expect(requestSpy).toHaveBeenCalledTimes(1);
        expect(successSpy).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledTimes(4);
      }
    );
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onDelete(url).reply(400, MOCK.ERROR);
    return removeDocumentFromVariance({ mineGuid, varianceGuid })(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchMineComplianceCodes` action creator", () => {
  const url = ENVIRONMENT.apiUrl + API.COMPLIANCE_CODES;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };

    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchMineComplianceCodes()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(3);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, MOCK.ERROR);
    return fetchMineComplianceCodes()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });
});

describe("`fetchVarianceStatusOptions` action creator", () => {
  const url = ENVIRONMENT.apiUrl + API.VARIANCE_STATUS_CODES;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };

    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchVarianceStatusOptions()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(3);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, MOCK.ERROR);
    return fetchVarianceStatusOptions()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });
});
