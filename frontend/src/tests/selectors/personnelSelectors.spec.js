import {getPersonnel, getPersonnelIds } from "@/selectors/personnelSelectors";
import personnelReducer from "@/reducers/personnelReducer";
import {storePersonnelList} from "@/actions/personnelActions";
import {PERSONNEL} from "@/constants/reducerTypes";

describe('personnelSelectors', () => {
  const personnelListInput = {"persons" : [{"person_guid": "test123"},{"person_guid": "test456"}]};
  const personnelListProcessed = {"test123": {"person_guid": "test123"}, "test456": {"person_guid": "test456"}};

  it('`getPersonnel` calls `personnelReducer.getPersonnel`', () => {
    const storeAction = storePersonnelList(personnelListInput);
    const storeState = personnelReducer({}, storeAction);
    const mockState = {
      [PERSONNEL]: storeState
    };

    expect(getPersonnel(mockState)).toEqual(personnelListProcessed);
  });

  it('`getPersonnelIds` calls `personnelReducer.getPersonnelIds`', () => {
    const storeAction = storePersonnelList(personnelListInput);
    const storeState = personnelReducer({}, storeAction);
    const mockState = {
      [PERSONNEL]: storeState
    };

    expect(getPersonnelIds(mockState)).toEqual(["test123", "test456"]);
  });

});