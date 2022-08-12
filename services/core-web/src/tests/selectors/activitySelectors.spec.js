import { getActivities } from "@common/selectors/activitySelectors";
import { activityReducer } from "@common/reducers/activityReducer";
import { storeActivities } from "@common/actions/activityActions";
import { ACTIVITIES } from "@common/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";

const mockResponse = Mock.ACTIVITIES.data;
const mockState = {
  activities: Mock.ACTIVITIES.data.records,
};

describe("activitySelectors", () => {
  const { activities } = mockState;

  it("`getActivities` calls `activityReducer.getActivities`", () => {
    const storeAction = storeActivities(mockResponse);
    const storeState = activityReducer({}, storeAction);
    const localMockState = {
      [ACTIVITIES]: storeState,
    };
    expect(getActivities(localMockState)).toEqual(activities);
  });
});
