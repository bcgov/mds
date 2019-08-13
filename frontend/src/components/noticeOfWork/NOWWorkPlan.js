import React, { Component } from "react";
import { Divider, Col, Row, Table } from "antd";
import * as Strings from "@/constants/strings";
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
        dataIndex: "efectedArea",
        key: "efectedArea",
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
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
      },
      {
        title: "Proponent Description",
        dataIndex: "proponentDescription",
        key: "proponentDescription",
      },
    ];

    return (
      <div>
        <br />
        <h3>Documents</h3>
        <Divider />
        <div className="padding-large--sides">
          <Table
            align="left"
            pagination={false}
            columns={columns}
            dataSource={[]}
            locale={{ emptyText: "There are no documents associated with this Notice of Work" }}
          />
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
        <NOWActivities />
        {this.renderDocuments()}
      </div>
    );
  }
}

export default NOWWorkPlan;
