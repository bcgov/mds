import { ThunkAction } from "redux-thunk";
import { RootState } from "../App";
import { AnyAction } from "redux";

/**
 * A custom type alias for a Redux Thunk action.
 *
 * @template ReturnType The expected base return type.  This is only needed if you are using the return value of the thunk.
 * @template ExtraArgument The type of the extra argument passed to the thunk. Defaults to `unknown`.
 */
export type AppThunk<ReturnType = void, ExtraArgument = unknown> = ThunkAction<
  ReturnType, // The return type of the thunk.
  RootState, // The type of the root state of the Redux store.
  ExtraArgument, // The type of the extra argument passed to the thunk.
  AnyAction // The type of the Redux action being dispatched.
>;
