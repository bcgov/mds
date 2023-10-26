import React, { FC } from "react";
import { connect } from "react-redux";
import { remove } from "lodash";
import { bindActionCreators } from "redux";
import { Button, Col, Popconfirm, Row, Typography } from "antd";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { arrayPush, change, Field, FieldArray, formValueSelector } from "redux-form";
import { required } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";
import { TRASHCAN } from "@/constants/assets";
import * as FORM from "@/constants/forms";
import ExplosivesPermitFileUpload from "@/components/Forms/ExplosivesPermit/ExplosivesPermitFileUpload";
import { IExplosivesPermitDocument, IOption } from "@mds/common";

interface DocumentCategoryFormProps {
  documents: IExplosivesPermitDocument[];
  categories: IOption[];
  isProcessed: boolean;
  mineGuid: string;
  change: (form: string, field: string, value: any) => void;
  arrayPush: (form: string, field: string, value: any) => void;
  infoText: string;
}

export const DocumentCategoryForm: FC<DocumentCategoryFormProps> = ({
  documents = [],
  categories,
  isProcessed,
  mineGuid,
  infoText,
  ...props
}) => {
  // File upload handlers
  const onFileLoad = (fileName, document_manager_guid) => {
    props.arrayPush(FORM.EXPLOSIVES_PERMIT, "documents", {
      document_name: fileName,
      document_manager_guid,
    });
  };

  const onRemoveFile = (err, fileItem) => {
    remove(documents, { document_manager_guid: fileItem.serverId });
    return props.change(FORM.EXPLOSIVES_PERMIT, "documents", documents);
  };

  const DocumentCategories = ({ fields }) => {
    return (
      <>
        {fields.map((field, index) => {
          const documentExists = fields.get(index) && fields.get(index).mine_document_guid;
          return (
            <div className="padding-sm margin-small" key={index}>
              <Row gutter={16}>
                <Col span={10}>
                  <Form.Item>
                    <Field
                      id={`${field}document_name`}
                      name={`${field}document_name`}
                      label="Document Name*"
                      validate={[required]}
                      disabled
                      component={renderConfig.FIELD}
                    />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item>
                    <Field
                      id={`${field}explosives_permit_document_type_code`}
                      name={`${field}explosives_permit_document_type_code`}
                      placeholder="Select a Document Category"
                      label="Document Category*"
                      component={renderConfig.SELECT}
                      data={categories}
                      validate={[required]}
                      disabled={documentExists && isProcessed}
                    />
                  </Form.Item>
                </Col>
                <Col span={4} className="right">
                  {documentExists && !isProcessed && (
                    <Popconfirm
                      placement="top"
                      title={[
                        <p key={index}>Are you sure you want to remove this file?</p>,
                        <p key={index}>This cannot be undone.</p>,
                      ]}
                      okText="Yes"
                      cancelText="No"
                      onConfirm={() => {
                        fields.remove(index);
                      }}
                    >
                      <Button ghost>
                        <img src={TRASHCAN} alt="Remove Document" />
                      </Button>
                    </Popconfirm>
                  )}
                </Col>
              </Row>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="document-container">
      <Form.Item label="Select Files/Upload files*">
        <div className="inputs">
          <FieldArray props={{}} name="documents" component={DocumentCategories} />
        </div>
        <Typography.Text>{infoText}</Typography.Text>
        <Field
          id="DocumentFileUpload"
          name="DocumentFileUpload"
          onFileLoad={onFileLoad}
          onRemoveFile={onRemoveFile}
          mineGuid={mineGuid}
          component={ExplosivesPermitFileUpload}
          allowMultiple
        />
      </Form.Item>
    </div>
  );
};

const selector = formValueSelector(FORM.EXPLOSIVES_PERMIT);
const mapStateToProps = (state) => ({
  documents: selector(state, "documents"),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
      arrayPush,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(DocumentCategoryForm);
