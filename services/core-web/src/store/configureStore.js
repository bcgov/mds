import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { loadingBarMiddleware } from "react-redux-loading-bar";
import { rootReducer } from "@/reducers/rootReducer";

export default function configureStore() {
  if (process.env.NODE_ENV === "development") {
    return createStore(
      rootReducer,
      applyMiddleware(
        thunk,
        loadingBarMiddleware({
          scope: "modal",
        })
      )
    );
  }
  return createStore(rootReducer, applyMiddleware(thunk, loadingBarMiddleware()));
}
