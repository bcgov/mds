import { REPORTS } from "@mds/common/constants/reducerTypes";
import reportSliceReducer from "@mds/common/redux/slices/reportSlice";

// Mount the slice reducer under the REPORTS key to preserve reducer typing and store integration
const reportReducerObject = {
  [REPORTS]: reportSliceReducer,
};

export default reportReducerObject;
