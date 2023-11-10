import { activityReducer } from "@mds/common/redux/reducers/activityReducer";
import { storeActivities } from "@mds/common/redux/actions/activityActions";

const getBaseExpectedValue = () => ({
  activities: [],
  totalActivities: null,
});

describe("activityReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = activityReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_ACTIVITIES", () => {
    const expectedValue = {
      ...getBaseExpectedValue(),
      activities: [
        {
          notification_document: {
            message: "this is a notification",
          },
        },
      ],
      totalActivities: 5,
    };
    const result = activityReducer(
      undefined,
      storeActivities({
        records: [
          {
            notification_document: {
              message: "this is a notification",
            },
          },
        ],
        current_page: 1,
        total_pages: 1,
        items_per_page: 50,
        total: 5,
      })
    );
    expect(result).toEqual(expectedValue);
  });
});
