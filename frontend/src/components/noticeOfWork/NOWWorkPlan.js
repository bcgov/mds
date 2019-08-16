/* eslint-disable */
import React, { Component } from "react";
import { Divider, Col, Row, Table } from "antd";
import * as Strings from "@/constants/strings";
import NullScreen from "@/components/common/NullScreen";
import NOWActivities from "@/components/noticeOfWork/NOWActivities";

export class NOWWorkPlan extends Component {
  renderSummaryOfReclamation = () => {
    const columns = [
      {
        title: "Activity",
        dataIndex: "activity",
        key: "activity",
      },
      {
        title: "Total Effected Area (ha)",
        dataIndex: "effectedArea",
        key: "effectedArea",
      },
      {
        title: "Estimated Cost of Reclamation",
        dataIndex: "cost",
        key: "cost",
      },
    ];
    return (
      <div>
        <br />
        <h3>Summary of Reclamation</h3>
        <Divider />
        <div className="padding-large--sides">
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">Total merchantable timber volume</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <br />
          <Table
            align="left"
            pagination={false}
            columns={columns}
            dataSource={[]}
            locale={{ emptyText: "No data" }}
            footer={() => "Total"}
          />
        </div>
      </div>
    );
  };

  renderDocuments = () => {
    const columns = [
      {
        title: "File name",
        dataIndex: "filename",
        key: "filename",
        render: (text) => <div title="File Name">{text}</div>,
      },
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
        render: (text) => <div title="Category">{text}</div>,
      },
      {
        title: "Proponent Description",
        dataIndex: "description",
        key: "description",
        render: (text) => <div title="Proponent Description">{text}</div>,
      },
    ];

    return (
      <div>
        <br />
        <h3>Documents</h3>
        <Divider />
        <div className="padding-large--sides">
          {this.props.noticeOfWork.documents.length >= 1 ? (
            <Table
              align="left"
              pagination={false}
              columns={columns}
              dataSource={this.props.noticeOfWork.documents}
              locale={{ emptyText: "There are no documents associated with this Notice of Work" }}
            />
          ) : (
            <NullScreen type="documents" />
          )}
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="page__content--nested">
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Description of Work</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        {this.renderSummaryOfReclamation()}
        <NOWActivities noticeOfWork={this.props.noticeOfWork} />
        {this.renderDocuments()}
      </div>
    );
  }
}

export default NOWWorkPlan;
