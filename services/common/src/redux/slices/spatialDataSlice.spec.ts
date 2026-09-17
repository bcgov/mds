import CustomAxios from "@mds/common/redux/customAxios";
import { getStore } from "@mds/common/redux/rootState";
import {
  clearSpatialData,
  fetchSpatialBundle,
  getSpatialBundle,
  getSpatialBundleGuid,
  updateSpatialBundlePurposes,
} from "./spatialDataSlice";

jest.mock("@mds/common/redux/customAxios", () => {
  const mockAxios = {
    get: jest.fn(),
    patch: jest.fn(),
  };
  return jest.fn(() => mockAxios);
});

const axios = (CustomAxios as jest.Mock)();

describe("spatialDataSlice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches a spatial bundle and stores it", async () => {
    const bundle = { bundle_id: 27, mine_document_bundle_id: 27, purpose_codes: [] };
    axios.get.mockResolvedValue({ data: bundle });
    const store = getStore();

    await store.dispatch(
      fetchSpatialBundle({ mineGuid: "mine-guid", mine_document_bundle_id: 27 })
    );

    expect(getSpatialBundle(store.getState())).toEqual(bundle);
    expect(getSpatialBundleGuid(store.getState())).toBe(27);
    expect(axios.get).toHaveBeenCalled();
  });

  it("updates purpose codes and clears spatial state", async () => {
    const bundle = { bundle_id: 27, purpose_codes: ["MBD"] };
    axios.patch.mockResolvedValue({ data: bundle });
    const store = getStore();

    await store.dispatch(
      updateSpatialBundlePurposes({
        mineGuid: "mine-guid",
        bundle_id: 27,
        purpose_codes: ["MBD"],
      })
    );

    expect(getSpatialBundle(store.getState())).toEqual(bundle);
    expect(getSpatialBundleGuid(store.getState())).toBe(27);
    expect(axios.patch).toHaveBeenCalledWith(
      expect.any(String),
      { purpose_codes: ["MBD"] },
      expect.any(Object)
    );

    store.dispatch(clearSpatialData());
    expect(getSpatialBundle(store.getState())).toBeNull();
    expect(getSpatialBundleGuid(store.getState())).toBeNull();
  });

  it("sends an empty list to clear every purpose", async () => {
    const cleared = { bundle_id: 27, purpose_codes: [] };
    axios.patch.mockResolvedValue({ data: cleared });
    const store = getStore();

    await store
      .dispatch(
        updateSpatialBundlePurposes({
          mineGuid: "mine-guid",
          bundle_id: 27,
          purpose_codes: [],
        })
      )
      .unwrap();

    expect(axios.patch).toHaveBeenCalledWith(
      expect.any(String),
      { purpose_codes: [] },
      expect.any(Object)
    );
    expect(getSpatialBundle(store.getState())).toEqual(cleared);
  });
});
