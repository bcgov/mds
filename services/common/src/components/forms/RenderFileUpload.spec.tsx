import React from "react";
import { render } from "enzyme";
import RenderFileUpload from "./RenderFileUpload";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { sharedReducer } from "@mds/common/redux/reducers/rootReducerShared";

jest.mock("filepond", () => {
  const filepond = jest.requireActual("filepond");

  return {
    ...filepond,
    supported: () => true,
  };
});

test("RenderFileUpload component renders correctly", () => {
  const props = {
    shouldAbortUpload: false,
    shouldReplaceFile: false,
    acceptedFileTypesMap: {},
    beforeDropFile: jest.fn(),
    beforeAddFile: jest.fn(),
    allowRevert: true,
    onRemoveFile: jest.fn(),
    allowMultiple: true,
    addFileStart: jest.fn(),
    allowReorder: true,
    maxFileSize: 1024,
    onProcessFiles: jest.fn(),
    onAbort: jest.fn(),
    labelIdle: "Drag and drop your files here",
    itemInsertLocation: "before",
  };

  const store = configureStore({ reducer: sharedReducer });
  const component = render(
    <Provider store={store}>
      <RenderFileUpload {...props} />
    </Provider>
  );
  expect(component).toMatchSnapshot();
});
