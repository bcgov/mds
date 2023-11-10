import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  createPermit,
  fetchPermits,
  updatePermit,
  createPermitAmendment,
  updatePermitAmendment,
  getPermitAmendment,
  removePermitAmendmentDocument,
  deletePermitAmendment,
  deletePermit,
  fetchDraftPermitByNOW,
  patchPermitNumber,
  fetchStandardPermitConditions,
  deleteStandardPermitCondition,
  updateStandardPermitCondition,
  createStandardPermitCondition,
  fetchPermitConditions,
  createPermitCondition,
  deletePermitCondition,
  updatePermitCondition,
} from "@mds/common/redux/actionCreators/permitActionCreator";
import * as genericActions from "@mds/common/redux/actions/genericActions";
import { ENVIRONMENT } from "@mds/common";
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

describe("`createPermit` action creator", () => {
  const permit_no = "MX-12315";
  const mine_guid = "12345-6789";
  const permit_status_code = "O";
  const url = ENVIRONMENT.apiUrl + API.PERMITS(mine_guid);
  const mockPayload = { permit_no, permit_status_code };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return createPermit(
      mine_guid,
      mockPayload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createPermit(mine_guid)(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchPermits` action creator", () => {
  const mine_guid = "12345-6789";
  const url = ENVIRONMENT.apiUrl + API.PERMITS(mine_guid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchPermits(mine_guid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchPermits(mine_guid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchDraftPermitByNOW` action creator", () => {
  const mine_guid = "12345-6789";
  const nowApplicationGuid = "23461346819745";
  const url = ENVIRONMENT.apiUrl + API.DRAFT_PERMITS(mine_guid, nowApplicationGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchDraftPermitByNOW(
      mine_guid,
      nowApplicationGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchDraftPermitByNOW(
      mine_guid,
      nowApplicationGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updatePermit` action creator", () => {
  const mine_guid = "12345-6789";
  const permit_guid = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl}${API.PERMITS(mine_guid)}/${permit_guid}`;

  const permit_status_code = "C";
  const description = "test description";

  const mockPayload = { permit_status_code, description };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, mockPayload).reply(200, mockResponse);
    return updatePermit(
      mine_guid,
      permit_guid,
      mockPayload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return updatePermit(
      mine_guid,
      permit_guid,
      mockPayload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`createPermitAmendment` action creator", () => {
  const mine_guid = "12345-6789";
  const permit_guid = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl}${API.PERMIT_AMENDMENTS(mine_guid, permit_guid)}`;

  const issue_date = "2001-01-01";
  const mockPayload = { issue_date };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return createPermitAmendment(
      mine_guid,
      permit_guid,
      mockPayload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createPermitAmendment(
      mine_guid,
      permit_guid,
      mockPayload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updatePermitAmendment` action creator", () => {
  const mineGuid = "12345-6789";
  const permitGuid = "123432";
  const permitAmdendmentGuid = "12345-6789";
  const issue_date = "2001-01-01";
  const description = "Test description";

  const url = `${ENVIRONMENT.apiUrl}${API.PERMIT_AMENDMENT(
    mineGuid,
    permitGuid,
    permitAmdendmentGuid
  )}`;
  const mockPayload = { issue_date, description };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, mockPayload).reply(200, mockResponse);
    return updatePermitAmendment(
      mineGuid,
      permitGuid,
      permitAmdendmentGuid,
      mockPayload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return updatePermitAmendment(
      mineGuid,
      permitGuid,
      permitAmdendmentGuid,
      mockPayload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`getPermitAmendment` action creator", () => {
  const mineGuid = "12345-6789";
  const permitAmdendmentGuid = "12345-6789";

  const url = `${ENVIRONMENT.apiUrl}${API.PERMIT_AMENDMENT(mineGuid, null, permitAmdendmentGuid)}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return getPermitAmendment(
      mineGuid,
      permitAmdendmentGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url).reply(418, MOCK.ERROR);
    return getPermitAmendment(
      mineGuid,
      permitAmdendmentGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`removePermitAmendmentDocument` action creator", () => {
  const mineGuid = "12345-6789";
  const permitGuid = "12345-6789";
  const permitAmdendmentGuid = "12345-6789";
  const documentGuid = "98765-4321";

  const url = `${ENVIRONMENT.apiUrl}${API.PERMIT_AMENDMENT_DOCUMENT(
    mineGuid,
    permitGuid,
    permitAmdendmentGuid,
    documentGuid
  )}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(200, mockResponse);
    return removePermitAmendmentDocument(
      mineGuid,
      permitGuid,
      permitAmdendmentGuid,
      documentGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onDelete(url).reply(418, MOCK.ERROR);
    return removePermitAmendmentDocument(
      mineGuid,
      permitGuid,
      permitAmdendmentGuid,
      documentGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`deletePermit` action creator", () => {
  const mineGuid = "12345-6789";
  const permitGuid = "123432";

  const url = `${ENVIRONMENT.apiUrl}${API.PERMIT_DELETE(mineGuid, permitGuid)}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(204, mockResponse);
    return deletePermit(
      mineGuid,
      permitGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return deletePermit(
      mineGuid,
      permitGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`deletePermitAmendment` action creator", () => {
  const mineGuid = "12345-6789";
  const permitGuid = "123432";
  const permitAmdendmentGuid = "54321";

  const url = `${ENVIRONMENT.apiUrl}${API.PERMIT_AMENDMENT(
    mineGuid,
    permitGuid,
    permitAmdendmentGuid
  )}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(204, mockResponse);
    return deletePermitAmendment(
      mineGuid,
      permitGuid,
      permitAmdendmentGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(500, MOCK.ERROR);
    return deletePermitAmendment(
      mineGuid,
      permitGuid,
      permitAmdendmentGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`patchPermitNumber` action creator", () => {
  const application_guid = "12345-6789";
  const permit_guid = "12345-6789";
  const mine_guid = "12345-6789";

  const url = `${ENVIRONMENT.apiUrl}${API.PERMITS(mine_guid)}/${permit_guid}`;

  const mockPayload = { now_application_guid: application_guid };

  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPatch(url, mockPayload).reply(200, mockResponse);
    return patchPermitNumber(
      permit_guid,
      mine_guid,
      mockPayload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPatch(url).reply(418, MOCK.ERROR);
    return patchPermitNumber(
      permit_guid,
      mine_guid,
      mockPayload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

// standard permit conditions
describe("`fetchStandardPermitConditions` action creator", () => {
  const noticeOfWorkType = "SAG";
  const url = ENVIRONMENT.apiUrl + API.STANDARD_PERMIT_CONDITIONS(noticeOfWorkType);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchStandardPermitConditions(noticeOfWorkType)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchStandardPermitConditions(noticeOfWorkType)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`deleteStandardPermitCondition` action creator", () => {
  const permitConditionGuid = "123432";

  const url = `${ENVIRONMENT.apiUrl}${API.STANDARD_PERMIT_CONDITION(permitConditionGuid)}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(204, mockResponse);
    return deleteStandardPermitCondition(permitConditionGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return deleteStandardPermitCondition(permitConditionGuid)(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateStandardPermitCondition` action creator", () => {
  const permitConditionGuid = "12345-6789";
  const payload = {};
  const url = `${ENVIRONMENT.apiUrl}${API.STANDARD_PERMIT_CONDITION(permitConditionGuid)}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, payload).reply(200, mockResponse);
    return updateStandardPermitCondition(
      permitConditionGuid,
      payload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return updateStandardPermitCondition(
      permitConditionGuid,
      payload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`createStandardPermitCondition` action creator", () => {
  const type = "SAG";
  const payload = { parent_permit_condition_id: null };
  const newPayload = {
    ...payload,
    notice_of_work_type: type,
    parent_standard_permit_condition_id: payload.parent_permit_condition_id,
  };
  const url = ENVIRONMENT.apiUrl + API.STANDARD_PERMIT_CONDITIONS(type);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, { standard_permit_condition: newPayload }).reply(200, mockResponse);
    return createStandardPermitCondition(
      type,
      payload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createStandardPermitCondition(
      type,
      payload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

// permit conditions
describe("`fetchPermitConditions` action creator", () => {
  const permitAmdendmentGuid = "768787";
  const url = ENVIRONMENT.apiUrl + API.PERMIT_CONDITIONS(null, null, permitAmdendmentGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchPermitConditions(permitAmdendmentGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchPermitConditions(permitAmdendmentGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`deletePermitCondition` action creator", () => {
  const permitConditionGuid = "12345-6789";
  const permitAmdendmentGuid = "1324812345";

  const url = `${ENVIRONMENT.apiUrl}${API.PERMIT_CONDITION(
    null,
    null,
    permitAmdendmentGuid,
    permitConditionGuid
  )}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(204, mockResponse);
    return deletePermitCondition(
      permitAmdendmentGuid,
      permitConditionGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return deletePermitCondition(
      permitAmdendmentGuid,
      permitConditionGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updatePermitCondition` action creator", () => {
  const permitConditionGuid = "12345-6789";
  const permitAmdendmentGuid = "1324812345";
  const payload = {};
  const url = `${ENVIRONMENT.apiUrl}${API.PERMIT_CONDITION(
    null,
    null,
    permitAmdendmentGuid,
    permitConditionGuid
  )}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, payload).reply(200, mockResponse);
    return updatePermitCondition(
      permitConditionGuid,
      permitAmdendmentGuid,
      payload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return updatePermitCondition(
      permitConditionGuid,
      permitAmdendmentGuid,
      payload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`createPermitCondition` action creator", () => {
  const permitAmdendmentGuid = "8765875687";
  const payload = {};
  const url = ENVIRONMENT.apiUrl + API.PERMIT_CONDITIONS(null, null, permitAmdendmentGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, { permit_condition: payload }).reply(200, mockResponse);
    return createPermitCondition(
      permitAmdendmentGuid,
      payload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createPermitCondition(
      permitAmdendmentGuid,
      payload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
