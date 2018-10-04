import {getParties, getPartyIds } from "@/selectors/partiesSelectors";
import partiesReducer from "@/reducers/partiesReducer";
import {storeParties} from "@/actions/partyActions";
import {PARTIES} from "@/constants/reducerTypes";

describe('partiesSelectors', () => {
  const listInput = {"parties" : [{"party_guid": "test123"},{"party_guid": "test456"}]};
  const listProcessed = {"test123": {"party_guid": "test123"}, "test456": {"party_guid": "test456"}};

  it('`getParties` calls `partiesReducer.getParties`', () => {
    const storeAction = storeParties(listInput);
    const storeState = partiesReducer({}, storeAction);
    const mockState = {
      [PARTIES]: storeState
    };

    expect(getParties(mockState)).toEqual(listProcessed);
  });

  it('`getPartyIds` calls `partiesReducer.getPartyIds`', () => {
    const storeAction = storeParties(listInput);
    const storeState = partiesReducer({}, storeAction);
    const mockState = {
      [PARTIES]: storeState
    };

    expect(getPartyIds(mockState)).toEqual(["test123", "test456"]);
  });

});