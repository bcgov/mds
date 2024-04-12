import React, { useState, useEffect, FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Field, change, getFormValues } from "redux-form";
import { Button, Col, Row, Popconfirm } from "antd";
import { required, maxLength } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import { getDropdownNoticeOfWorkApplicationDocumentTypeOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import { NOTICE_OF_WORK_DOCUMENT } from "@mds/common/constants/API";
import { DOCUMENT, EXCEL, IMAGE, SPATIAL } from "@/constants/fileTypes";
import * as FORM from "@/constants/forms";
import { IMineDocument } from "@mds/common";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { closeModal } from "@mds/common/redux/actions/modalActions";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import RenderCheckbox from "@mds/common/components/forms/RenderCheckbox";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderDate from "@mds/common/components/forms/RenderDate";
import RenderFileUpload from "@mds/common/components/forms/RenderFileUpload";
import { requiredNewFiles } from "@mds/common/redux/utils/Validate";

export interface EditNoticeOfWorkDocumentFormProps {
  onSubmit: (values) => void | Promise<void>;
  title: string;
  now_application_guid: string;
  isEditMode: boolean;
  isInCompleteStatus: boolean;
  categoriesToShow: string[];
  initialValues?: any;
}

const EditNoticeOfWorkDocumentForm: FC<EditNoticeOfWorkDocumentFormProps> = ({
  onSubmit,
  title,
  now_application_guid,
  isEditMode,
  isInCompleteStatus,
  categoriesToShow = [],
  initialValues,
}) => {
  const dispatch = useDispatch();
  const formValues = useSelector(getFormValues(FORM.EDIT_NOTICE_OF_WORK_DOCUMENT_FORM)) ?? {};
  const { is_final_package } = formValues;
  const dropdownNoticeOfWorkApplicationDocumentTypeOptions = useSelector(
    getDropdownNoticeOfWorkApplicationDocumentTypeOptions
  );
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [disabled, setDisabled] = useState(false);

  const filteredDropDownOptions = dropdownNoticeOfWorkApplicationDocumentTypeOptions.filter(
    ({ subType, value }) => {
      if (categoriesToShow.length > 0) {
        return categoriesToShow.includes(subType ?? value);
      }
      return true;
    }
  );

  useEffect(() => {
    dispatch(change(FORM.EDIT_NOTICE_OF_WORK_DOCUMENT_FORM, "uploadedFiles", uploadedFiles));
  }, [uploadedFiles]);

  const onFileLoad = (document_name: string, document_manager_guid: string) => {
    const newFile = { document_name, document_manager_guid } as IMineDocument;
    const fileAlreadyInList = uploadedFiles.includes(
      (doc) => doc.document_manager_guid === document_manager_guid
    );
    if (!fileAlreadyInList) {
      setUploadedFiles([...uploadedFiles, newFile]);
    }
    setDisabled(false);
  };

  const onRemoveFile = (err, fileItem) => {
    const remainingFiles = uploadedFiles.filter(
      (file) => file.document_manager_guid !== fileItem.serverId
    );
    setUploadedFiles(remainingFiles);
  };

  return (
    <FormWrapper
      name={FORM.EDIT_NOTICE_OF_WORK_DOCUMENT_FORM}
      onSubmit={onSubmit}
      initialValues={{ now_application_guid, ...initialValues }}
      reduxFormConfig={{
        touchOnBlur: false,
        onSubmitSuccess: resetForm(FORM.EDIT_NOTICE_OF_WORK_DOCUMENT_FORM),
      }}
    >
      <Row gutter={16}>
        <Col span={24}>
          {!isEditMode && (
            <Field
              id="now_application_document_type_code"
              name="now_application_document_type_code"
              label="Document Category"
              placeholder="Select a document type"
              component={RenderSelect}
              data={filteredDropDownOptions}
              validate={[required]}
              required
            />
          )}
          <Field
            id="description"
            name="description"
            label="Description"
            component={RenderAutoSizeField}
            maximumCharacters={280}
            validate={maxLength(280)}
          />
          {!isInCompleteStatus && (
            <Field
              id="is_final_package"
              name="is_final_package"
              label="Part of permit package"
              type="checkbox"
              component={RenderCheckbox}
            />
          )}
          {is_final_package && (
            <>
              <Row gutter={16}>
                <Col md={12} xs={24}>
                  <Field
                    id="preamble_title"
                    name="preamble_title"
                    label="Title"
                    placeholder="Title"
                    component={RenderField}
                  />
                </Col>
                <Col md={12} xs={24}>
                  <Field
                    id="preamble_author"
                    name="preamble_author"
                    label="Author"
                    placeholder="Author"
                    component={RenderField}
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col md={12} xs={24}>
                  <Field
                    id="preamble_date"
                    name="preamble_date"
                    label="Date"
                    placeholder="Date"
                    component={RenderDate}
                  />
                </Col>
              </Row>
            </>
          )}
          {!isEditMode && (
            <Field
              id="notice_of_work_file_upload"
              name="uploadedFiles"
              component={RenderFileUpload}
              onFileLoad={onFileLoad}
              onRemoveFile={onRemoveFile}
              addFileStart={() => setDisabled(true)}
              uploadUrl={NOTICE_OF_WORK_DOCUMENT(now_application_guid)}
              acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL, ...IMAGE, ...SPATIAL }}
              listedFileTypes={["document", "spreadsheet", "image", "spatial"]}
              allowMultiple
              allowRevert
              label={<h5 style={{ display: "inline" }}>Document Upload</h5>}
              labelSubtitle="All files uploaded will be classified using the selected Category. To upload other
              file types, re-open this form after submitting the current files."
              abbrevLabel
              required
              validate={[requiredNewFiles]}
            />
          )}
        </Col>
      </Row>
      <div className="right center-mobile">
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to cancel?"
          onConfirm={() => dispatch(closeModal())}
          okText="Yes"
          cancelText="No"
        >
          <Button className="full-mobile" type="default">
            Cancel
          </Button>
        </Popconfirm>
        <Button className="full-mobile" type="primary" htmlType="submit" disabled={disabled}>
          {title}
        </Button>
      </div>
    </FormWrapper>
  );
};
export default EditNoticeOfWorkDocumentForm;
