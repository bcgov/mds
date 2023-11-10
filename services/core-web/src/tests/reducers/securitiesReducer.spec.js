import { securitiesReducer } from "@mds/common/redux/reducers/securitiesReducer";
import { storeMineBonds, storeMineReclamationInvoices } from "@mds/common/redux/actions/securitiesActions";
import * as MOCK from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  bonds: [],
  reclamationInvoices: [],
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("securitiesReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = securitiesReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINE_BONDS", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.bonds = MOCK.BONDS.records;
    const result = securitiesReducer(undefined, storeMineBonds(MOCK.BONDS));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINE_RECLAMATION_INVOICES", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.reclamationInvoices = MOCK.RECLAMATION_INVOICES.records;
    const result = securitiesReducer(
      undefined,
      storeMineReclamationInvoices(MOCK.RECLAMATION_INVOICES)
    );
    expect(result).toEqual(expectedValue);
  });
});
