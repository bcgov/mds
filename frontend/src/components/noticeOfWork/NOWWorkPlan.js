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
        render: (text) => <div title="Activity">{text}</div>,
      },
      {
        title: "Total Effected Area (ha)",
        dataIndex: "effectedArea",
        key: "effectedArea",
        render: (text) => <div title="Total Effected Area (ha)">{text}</div>,
      },
      {
        title: "Estimated Cost of Reclamation",
        dataIndex: "cost",
        key: "cost",
        render: (text) => <div title="Estimated Cost of Reclamation">{text}</div>,
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
              <p>{"Unknown" || Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <br />
          <Table
            align="left"
            pagination={false}
            columns={columns}
            dataSource={[]}
            locale={{ emptyText: "Unknown" }}
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
        render: (text, record) => (
          <div title="File Name">
            {record.url ? (
              <a href={record.url} target="_blank" rel="noopener noreferrer">
                {text}
              </a>
            ) : (
              <span>{text}</span>
            )}
          </div>
        ),
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

    const transfromData = (documents) =>
      documents.map((document) => ({
        filename: document.filename || Strings.EMPTY_FIELD,
        url: document.documenturl,
        category: document.documenttype || Strings.EMPTY_FIELD,
        description: document.description || Strings.EMPTY_FIELD,
      }));

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
              dataSource={transfromData(this.props.noticeOfWork.documents)}
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
