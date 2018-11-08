import mineReducer from "@/reducers/mineReducer";
import { 
  updateMine,
   storeMine, 
   storeMineList, 
   storeMineNameList, 
   storeStatusOptions,
   storeRegionOptions
   } from "@/actions/mineActions";
import * as MOCK from '@/tests/mocks/dataMocks'

describe('mineReducer', () => {

  it('receives undefined', () => {
    const expectedValue = {
      mines: {},
      mineIds: [],
      mineNameList:[],
      minesPageData: {},
      mineGuid: false,
      mineStatusOptions: [],
      mineRegionOptions: [],
    };
    const result = mineReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it('receives STORE_MINE_LIST', () => {
    const expectedValue = {
      mines: {},
      mineIds: [],
      mineNameList: [],
      minesPageData: {
        'mines': [],
        'current_page': 1,
        'total_pages': 1,
        'items_per_page': 50,
        'total': 1
      },
      mineGuid: false,
      mineStatusOptions: [],
      mineRegionOptions: [],
    };
    const result = mineReducer(undefined, storeMineList({
      'mines': [],
      'current_page': 1,
      'total_pages': 1,
      'items_per_page': 50,
      'total': 1
    }));
    expect(result).toEqual(expectedValue);
  });

  it('receives STORE_MINE', () => {
    const expectedValue = {
      mines: {"test123": {"guid": "test123"}},
      mineIds: ["test123"],
      mineNameList: [],
      minesPageData: {},
      mineGuid: "test123",
      mineStatusOptions: [],
      mineRegionOptions: [],
    };
    const result = mineReducer(undefined, storeMine({"guid": "test123"}, "test123"));
    expect(result).toEqual(expectedValue);
  });

  it('receives UPDATE_MINE_RECORD', () => {
    const storedMineValue = {
      mines: {"test123": {"guid": "test123"}},
      mineIds: ["test123"],
      mineNameList: [],
      minesPageData: {},
      mineGuid: "test123",
      mineStatusOptions: [],
      mineRegionOptions: [],
    };
    const updatedMineValue = {
      mines: {"test456": {"guid": "test456"}},
      mineIds: ["test456"],
      mineNameList: [],
      minesPageData: {},
      mineGuid: "test456",
      mineStatusOptions: [],
      mineRegionOptions: [],
    };
    const storedMine = mineReducer(undefined, storeMine({"guid": "test123"}, "test123"));
    expect(storedMine).toEqual(storedMineValue);
    const updatedMine = mineReducer(undefined, updateMine({"guid": "test456"}, "test456"));
    expect(updatedMine).toEqual(updatedMineValue);
  });

  it('receives STORE_MINE_NAME_LIST', () => {
    const expectedValue = {
      mines: {},
      mineIds: [],
      mineNameList: { mines: [{ "guid": "test123", "mine_name": "mineName", "mine_no": "2039"}]},
      minesPageData: {},
      mineGuid: false,
      mineStatusOptions: [],
      mineRegionOptions: [],
    };
    const result = mineReducer(undefined, storeMineNameList({ mines: [{ "guid": "test123", "mine_name": "mineName", "mine_no": "2039" }] }));
    expect(result).toEqual(expectedValue);
  });

  it('receives STORE_STATUS_OPTIONS', () => {
    const expectedValue = {
      mines: {},
      mineIds: [],
      mineNameList: [],
      minesPageData: {},
      mineGuid: false,
      mineStatusOptions: MOCK.STATUS_OPTIONS.options,
      mineRegionOptions: [],
    };
    const result = mineReducer(undefined, storeStatusOptions(MOCK.STATUS_OPTIONS));
    expect(result).toEqual(expectedValue);
  });

  it('receives STORE_REGION_OPTIONS', () => {
    const expectedValue = {
      mines: {},
      mineIds: [],
      mineNameList: [],
      minesPageData: {},
      mineGuid: false,
      mineStatusOptions: [],
      mineRegionOptions: MOCK.REGION_OPTIONS.options
    };
    const result = mineReducer(undefined, storeRegionOptions(MOCK.REGION_OPTIONS));
    expect(result).toEqual(expectedValue);
  });
});