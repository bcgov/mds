import React, { FC } from "react";
import { useDispatch } from "react-redux";
import { Field } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { EXPLOSIVES_PERMIT_DOCUMENTS } from "@mds/common/constants/API";
import FileUpload from "@/components/common/FileUpload";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";
import { setIsFormLoading } from "@mds/common/redux/actions/modalActions";

interface ExplosivesPermitFileUploadProps {
  onFileLoad: (fileName: string, documentGuid: string) => null;
  onRemoveFile: (err: any, fileItem: any) => null;
  mineGuid: string;
  esupGuid: string;
}

export const ExplosivesPermitFileUpload: FC<ExplosivesPermitFileUploadProps> = (props) => {
  const dispatch = useDispatch();
  const setIsLoading = (loading: boolean) => {
    dispatch(setIsFormLoading(loading));
  };

  return (
    <Form.Item>
      <Field
        id="fileUpload"
        name="fileUpload"
        component={FileUpload}
        uploadUrl={EXPLOSIVES_PERMIT_DOCUMENTS(props.mineGuid, props.esupGuid)}
        acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
        onFileLoad={props.onFileLoad}
        onRemoveFile={(err, fileItem) => {
          props.onRemoveFile(err, fileItem);
          setIsLoading(false);
        }}
        allowRevert
        allowMultiple
        onProcessFiles={() => setIsLoading(false)}
        onAbort={() => setIsLoading(false)}
        beforeAddFile={() => setIsLoading(true)}
      />
    </Form.Item>
  );
};

export default ExplosivesPermitFileUpload;
