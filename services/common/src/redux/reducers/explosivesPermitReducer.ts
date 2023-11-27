import { IExplosivesPermit } from "@mds/common/interfaces/permits/explosivesPermit.interface";
import * as actionTypes from "@mds/common/constants/actionTypes";
import { EXPLOSIVES_PERMITS } from "@mds/common/constants/reducerTypes";
import { RootState } from "@mds/common/redux/rootState";

interface IExplosivesPermitReducerState {
  explosivesPermits: IExplosivesPermit[];
}

const initialState: IExplosivesPermitReducerState = {
  explosivesPermits: [],
};

export const explosivesPermitReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_EXPLOSIVES_PERMITS:
      const records = action.payload?.records ?? [];
      const explosivesPermits = records.map((permit) => {
        const amendment_count = permit.explosives_permit_amendments.length;
        const amendments = permit.explosives_permit_amendments.map((a, index) => {
          const documents = a.documents.map((d) => ({
            ...d,
            explosives_permit_document_type_code: d.explosives_permit_amendment_document_type_code,
          }));
          return { ...a, documents, amendment_count, isAmendment: true, amendment_no: index + 1 };
        });
        return {
          ...permit,
          explosives_permit_amendments: amendments ?? [],
          amendment_count,
          isAmendment: false,
          amendment_no: 0,
        };
      });
      return {
        ...state,
        explosivesPermits,
      };
    default:
      return state;
  }
};

const explosivesPermitReducerObject = {
  [EXPLOSIVES_PERMITS]: explosivesPermitReducer,
};

export const getExplosivesPermits = (state: RootState) =>
  state[EXPLOSIVES_PERMITS].explosivesPermits;
export default explosivesPermitReducerObject;
