/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table, Button } from "antd";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { RED_CLOCK, BRAND_PENCIL } from "@/constants/assets";
import NullScreen from "@/components/common/NullScreen";
import { formatDate } from "@/utils/helpers";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";
import * as String from "@/constants/strings";
import { COLOR } from "@/constants/styles";

const { errorRed } = COLOR;

const propTypes = {
  variances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  openViewVarianceModal: PropTypes.func.isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  openModal: PropTypes.func.isRequired,
};

export class MineVarianceApplicationTable extends Component {
  sortByDateOrID = (variance1, variance2) => {
    const date1 = Date.parse(variance1.expiry_date) || 0;
    const date2 = Date.parse(variance2.expiry_date) || 0;
    return date1 === date2 ? variance1.variance_id - variance2.variance_id : date1 - date2;
  };

  transformRowData = (variances, codeHash, statusHash) =>
    variances.sort(this.sortByDateOrID).map((variance) => {
      return {
        key: variance.variance_id,
        variance,
        status: statusHash[variance.variance_application_status_code],
        compliance_article_id: codeHash[variance.compliance_article_id] || String.EMPTY_FIELD,
        note: variance.note,
        received_date: formatDate(variance.received_date) || String.EMPTY_FIELD,
        documents: variance.documents,
      };
    });

  render() {
    const columns = [
      {
        title: "Code Section",
        dataIndex: "compliance_article_id",
        render: (text, record) => <div title="Code Section">{text}</div>,
      },
      {
        title: "Submission Date",
        dataIndex: "received_date",
        render: (text, record) => <div title="Submission Date">{text}</div>,
      },
      {
        title: "Application  Status",
        dataIndex: "status",
        render: (text, record) => <div title="Application Status">{text}</div>,
      },
      {
        title: "Documents",
        dataIndex: "documents",
        render: (text, record) => (
          <div title="Documents">
            {record.documents
              ? record.documents.map((file) => (
                  <div key={file.mine_document_guid}>
                    <a
                      role="link"
                      key={file.mine_document_guid}
                      onClick={() => downloadFileFromDocumentManager(file.document_manager_guid)}
                      // Accessibility: Event listener
                      onKeyPress={() => downloadFileFromDocumentManager(file.document_manager_guid)}
                      // Accessibility: Focusable element
                      tabIndex="0"
                    >
                      {file.document_name}
                    </a>
                  </div>
                ))
              : "-"}
          </div>
        ),
      },
      {
        title: "",
        dataIndex: "variance",
        render: (text, record) => (
          <div title="" align="right">
            <AuthorizationWrapper permission={Permission.CREATE}>
              <Button
                type="primary"
                size="small"
                ghost
                onClick={(event) => this.props.openModal(event, record.variance)}
              >
                <img src={BRAND_PENCIL} alt="Edit/View" />
              </Button>
            </AuthorizationWrapper>
          </div>
        ),
      },
    ];

    return (
      <div>
        <Table
          align="left"
          pagination={false}
          columns={columns}
          locale={{ emptyText: <NullScreen type="variance-applications" /> }}
          dataSource={this.transformRowData(
            this.props.variances,
            this.props.complianceCodesHash,
            this.props.varianceStatusOptionsHash
          )}
        />
      </div>
    );
  }
}

MineVarianceApplicationTable.propTypes = propTypes;

export default MineVarianceApplicationTable;
