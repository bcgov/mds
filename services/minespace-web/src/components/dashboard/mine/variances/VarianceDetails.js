import React from "react";
import PropTypes from "prop-types";
import { Descriptions } from "antd";
import { formatDate } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import DocumentTable from "@/components/common/DocumentTable";
import { documentNameColumn, uploadDateColumn } from "@/components/common/DocumentColumns";
import * as Strings from "@/constants/strings";
import { renderCategoryColumn } from "@/components/common/CoreTableCommonColumns";
import { MineDocument } from "@mds/common/models/documents/document";

const propTypes = {
  variance: CustomPropTypes.variance.isRequired,
  mineName: PropTypes.string.isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const VarianceDetails = (props) => {
  const documents = props.variance.documents.map(
    (doc) =>
      new MineDocument({
        ...doc,
        category: doc.variance_document_category_code,
        upload_date: doc.created_at,
      })
  );
  const documentColumns = [
    documentNameColumn(),
    renderCategoryColumn("category", "Category", props.documentCategoryOptionsHash),
    uploadDateColumn(),
  ];
  const getActiveStatus = () => {
    if (props.variance.expiry_date) {
      if (Date.parse(props.variance.expiry_date) < new Date()) {
        return "Expired";
      }
      return "Active";
    }
    return Strings.EMPTY_FIELD;
  };

  return (
    <div>
      <Descriptions colon={false} column={1}>
        <Descriptions.Item label="Application Status">
          {props.varianceStatusOptionsHash[props.variance.variance_application_status_code]}
        </Descriptions.Item>
        <Descriptions.Item label="Submission Date">
          {formatDate(props.variance.received_date) || Strings.EMPTY_FIELD}
        </Descriptions.Item>
        {props.variance.variance_application_status_code === Strings.VARIANCE_APPROVED_CODE && (
          <>
            <Descriptions.Item label="Issue Date">
              {formatDate(props.variance.issue_date) || Strings.EMPTY_FIELD}
            </Descriptions.Item>
            <Descriptions.Item label="Expiry Date">
              {formatDate(props.variance.expiry_date) || Strings.EMPTY_FIELD}
            </Descriptions.Item>
            <Descriptions.Item label="Approval Status">{getActiveStatus()}</Descriptions.Item>
          </>
        )}
        <Descriptions.Item label="Mine">{props.mineName || Strings.EMPTY_FIELD}</Descriptions.Item>
        <Descriptions.Item label="Code Section">
          {props.variance.compliance_article_id
            ? props.complianceCodesHash[props.variance.compliance_article_id]
            : Strings.EMPTY_FIELD}
        </Descriptions.Item>
        <Descriptions.Item label="Description">
          {props.variance.note || Strings.EMPTY_FIELD}
        </Descriptions.Item>
      </Descriptions>
      <DocumentTable
        documents={documents}
        documentParent="variance"
        documentColumns={documentColumns}
      />
      <Descriptions size="small">
        <Descriptions.Item label="Created By" size="small">
          {props.variance.created_by || Strings.EMPTY_FIELD}
        </Descriptions.Item>
        <Descriptions.Item label="Updated By">
          {props.variance.updated_by || Strings.EMPTY_FIELD}
        </Descriptions.Item>
        <Descriptions.Item label="Updated Date">
          {formatDate(props.variance.updated_timestamp) || Strings.EMPTY_FIELD}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

VarianceDetails.propTypes = propTypes;

export default VarianceDetails;
