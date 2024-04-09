import React from "react";
import { render } from "enzyme";
import RenderFileUpload from "./RenderFileUpload";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PDF } from "../..";

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
    acceptedFileTypesMap: PDF,
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
    itemInsertLocation: "before",
  };

  const component = render(
    <ReduxWrapper initialState={{}}>
      <RenderFileUpload {...props} />
    </ReduxWrapper>
  );
  expect(component).toMatchSnapshot();
});
