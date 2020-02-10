import React from "react";
import PropTypes from "prop-types";
import { Descriptions } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { formatDate } from "@/utils/helpers";
import DocumentTable from "@/components/common/DocumentTable";
import * as Strings from "@/constants/strings";

const propTypes = {
  variance: CustomPropTypes.variance.isRequired,
  mineName: PropTypes.string.isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const VarianceDetails = (props) => {
  const isOverdue =
    props.variance.expiry_date && Date.parse(props.variance.expiry_date) < new Date();

  return (
    <div>
      <Descriptions colon={false} column={1}>
        <Descriptions.Item label="Application Status">
          {props.varianceStatusOptionsHash[props.variance.variance_application_status_code]}
        </Descriptions.Item>
        <Descriptions.Item label="Approval Status">
          {isOverdue ? "Expired" : "Active"}
        </Descriptions.Item>
        <Descriptions.Item label="Submission Date">
          {formatDate(props.variance.received_date) || Strings.EMPTY_FIELD}
        </Descriptions.Item>
        <Descriptions.Item label="Mine">{props.mineName || Strings.EMPTY_FIELD}</Descriptions.Item>
        <Descriptions.Item label="Code Section">
          {props.variance.compliance_article_id
            ? props.complianceCodesHash[props.variance.compliance_article_id]
            : Strings.EMPTY_FIELD}
        </Descriptions.Item>
        <Descriptions.Item label="Description">
          {props.variance.note || Strings.EMPTY_FIELD}
        </Descriptions.Item>
        <Descriptions.Item>
          <DocumentTable
            documents={props.variance.documents}
            documentCategoryOptionsHash={props.documentCategoryOptionsHash}
          />
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

VarianceDetails.propTypes = propTypes;

export default VarianceDetails;
