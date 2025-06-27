import React from "react";
import { Button, Col, Divider, Row, Typography } from "antd";
import { arrayPush, arrayRemove, Field, FieldArray, getFormValues } from "../../forms/form";
import RenderFileUpload from "../../forms/RenderFileUpload";
import { DOCUMENT, EXCEL, IMAGE, SPATIAL } from "@mds/common/constants/fileTypes";
import { PROJECT_SUMMARY_ENVIRONMENT_FINAL_APPLICATION_DOCUMENTS } from "@mds/common/constants/API";
import { useParams } from "react-router-dom";
import { required } from "@mds/common/redux/utils/Validate";
import RenderField from "../../forms/RenderField";
import RenderSelect from "../../forms/RenderSelect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrashCan,
} from "@fortawesome/pro-regular-svg-icons";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { FORM } from "@mds/common/constants/forms";
import RenderGroupCheckbox, { normalizeGroupCheckBox } from "../../forms/RenderGroupCheckbox";
import { deleteConfirmWrapper } from "../../common/ActionMenu";
import { IAmsFinalApplication } from "@mds/common/interfaces/projects/amsFinalApplication.interface";
import { AMS_FINAL_APPLICATION_DOCUMENT_TYPES } from "@mds/common/constants/enums";

const formName = FORM.ADD_EDIT_AMS_FINAL_APPLICATION;
const documentTypeOptions = Object.entries(AMS_FINAL_APPLICATION_DOCUMENT_TYPES).map(([type, description]) => {
    return { value: type, label: description };
});

const EnvDocumentCategoryForm = ({ fields }) => {
    const dispatch = useAppDispatch();
    const formValues = useAppSelector(getFormValues(formName)) as IAmsFinalApplication;

    const handleDelete = (index: number) => {
        const document = formValues.documents[index];
        deleteConfirmWrapper(`file: ${document.document_name}`,
            async () => dispatch(arrayRemove(formName, 'documents', index))
        );
    };

    return (
        <>
            {fields.map((field: string, index: number) => {
                const isSaved = Boolean(formValues.documents[index].mine_document_guid);
                return (
                    <div key={field}>
                        <Row gutter={16}>
                            <Col flex={1}>
                                <Field
                                    name={`${field}document_name`}
                                    label="Document Name"
                                    required
                                    validate={[required]}
                                    disabled
                                    component={RenderField}
                                />
                            </Col>
                            <Col span={8}>
                                <Field
                                    name={`${field}ams_final_application_document_type_code`}
                                    label="Document Category"
                                    placeholder="Select a Document Category"
                                    component={RenderSelect}
                                    data={documentTypeOptions}
                                    required
                                    validate={[required]}
                                    allowClear={false}
                                />
                            </Col>
                        </Row>
                        {isSaved && <Button
                            className="fa-icon-container"
                            type="primary"
                            danger
                            icon={<FontAwesomeIcon icon={faTrashCan} />}
                            onClick={() => handleDelete(index)}
                        >Delete File</Button>}
                        <Divider />
                    </div>
                );
            })}
        </>
    );
};

const EnvDocumentsTab = () => {
    const { projectSummaryGuid } = useParams<{ projectSummaryGuid: string }>();
    const dispatch = useAppDispatch();
    const formValues = useAppSelector(getFormValues(formName)) as IAmsFinalApplication;

    const preSubmittedCategories = [
        AMS_FINAL_APPLICATION_DOCUMENT_TYPES.LOC,
        AMS_FINAL_APPLICATION_DOCUMENT_TYPES.SIT,
        AMS_FINAL_APPLICATION_DOCUMENT_TYPES.DFF
    ];
    const preSubmittedOptions = documentTypeOptions.filter((o) => {
        return preSubmittedCategories.includes(o.label)
    });

    const onFileLoad = (document_name, document_manager_guid) => {
        dispatch(arrayPush(
            formName,
            "documents",
            {
                document_name,
                document_manager_guid
            }
        ));
    };

    const onRemoveFile = (_error, file) => {
        const document_manager_guid = file?.serverId;
        const docIndex = formValues.documents.findIndex((d) => d.document_manager_guid === document_manager_guid);
        if (docIndex) {
            dispatch(arrayRemove(formName, "documents", docIndex));
        }
    };

    return (
        <>
            <Typography.Title level={3}>Documents</Typography.Title>
            <Field
                name="pre_submitted_files"
                label="Check those that were submitted as part of the Project Description"
                component={RenderGroupCheckbox}
                options={preSubmittedOptions}
                normalize={normalizeGroupCheckBox}
            />
            <FieldArray props={{}} name="documents" component={EnvDocumentCategoryForm} />
            <Field
                name="uploadedFiles"
                label="Upload Files"
                component={RenderFileUpload}
                maxFileSize="750MB"
                acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL, ...IMAGE, ...SPATIAL }}
                allowRevert
                allowMultiple
                listedFileTypes={["document", "image", "spreadsheet", "spatial"]}
                abbrevLabel={true}
                uploadUrl={PROJECT_SUMMARY_ENVIRONMENT_FINAL_APPLICATION_DOCUMENTS(projectSummaryGuid)}
                onFileLoad={onFileLoad}
                onRemoveFile={onRemoveFile}
            />
        </>)
};

export default EnvDocumentsTab;