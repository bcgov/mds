import React, { Component } from "react";
import { Divider, Col, Row, Table } from "antd";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@/constants/strings";
import NullScreen from "@/components/common/NullScreen";
import NOWActivities from "@/components/noticeOfWork/NOWActivities";
import LinkButton from "@/components/common/LinkButton";
import { downloadNowDocument } from "@/utils/actionlessNetworkCalls";
import { UNIQUELY_SPATIAL } from "@/constants/fileTypes";
import { isMineralOrCoal, isPlacer, isSandAndGravelOrQuarry } from "@/constants/NOWConditions";

const propTypes = {
  noticeOfWork: CustomPropTypes.nowApplication.isRequired,
};

export class NOWWorkPlan extends Component {
  renderSummaryOfReclamation = () => {
    const nowType = this.props.noticeOfWork.noticeofworktype;
    const columns = [
      {
        title: "Activity",
        dataIndex: "activity",
        key: "activity",
        render: (text, record) => (
          <div title="Activity" style={record.footer ? { fontWeight: "bold" } : {}}>
            {text}
          </div>
        ),
      },
      {
        title: "Total Effected Area (ha)",
        dataIndex: "effectedArea",
        key: "effectedArea",
        render: (text, record) => (
          <div title="Total Effected Area (ha)" style={record.footer ? { fontWeight: "bold" } : {}}>
            {text}
          </div>
        ),
      },
      {
        title: "Estimated Cost of Reclamation",
        dataIndex: "cost",
        key: "cost",
        render: (text, record) => (
          <div
            title="Estimated Cost of Reclamation"
            style={record.footer ? { fontWeight: "bold" } : {}}
          >
            {text}
          </div>
        ),
      },
    ];

    // conditional rendering of the data is based on the same logic used for the activity sections on the NoW application form
    const cutLinesRow =
      isMineralOrCoal(nowType) && isPlacer(nowType)
        ? [
            {
              activity: "Cut Lines and Induced Polarization Survey",
              effectedArea: this.props.noticeOfWork.cutlinesexplgriddisturbedarea || Strings.ZERO,
              cost: this.props.noticeOfWork.cutlinesreclamationcost || Strings.ZERO,
            },
          ]
        : [];

    const placerRow = isPlacer(nowType)
      ? [
          {
            activity: "Placer Operations",
            effectedArea: this.props.noticeOfWork.placertotaldistarea || Strings.ZERO,
            cost: this.props.noticeOfWork.placerreclamationcost || Strings.ZERO,
          },
        ]
      : [];

    const sandAndGravelRow = isSandAndGravelOrQuarry(nowType)
      ? [
          {
            activity: "Sand and Gravel / Quarry Operations",
            effectedArea: this.props.noticeOfWork.sandgrvqrytotaldistarea || Strings.ZERO,
            cost: this.props.noticeOfWork.sandgrvqryreclamationcost || Strings.ZERO,
          },
        ]
      : [];

    const bulkSamplesRow = isMineralOrCoal(nowType)
      ? [
          {
            activity: "Surface Bulk Sample",
            effectedArea: this.props.noticeOfWork.surfacebulksampletotaldistarea || Strings.ZERO,
            cost: this.props.noticeOfWork.surfacebulksamplereclcost || Strings.ZERO,
          },
        ]
      : [];

    const undergroundExpRow =
      isMineralOrCoal(nowType) && isPlacer(nowType)
        ? [
            {
              activity: "Underground Exploration",
              effectedArea: this.props.noticeOfWork.underexptotaldistarea || Strings.ZERO,
              cost: this.props.noticeOfWork.underexpreclamationcost || Strings.ZERO,
            },
          ]
        : [];

    const data = [
      {
        activity: "Access Roads, trails, Helipads, Air Strips, Boat Ramps",
        effectedArea: this.props.noticeOfWork.expaccesstotaldistarea || Strings.ZERO,
        cost: this.props.noticeOfWork.expaccessreclamationcost || Strings.ZERO,
      },
      {
        activity: "Camps, Buildings, Staging Area, Fuel/Lubricant Storage",
        effectedArea: this.props.noticeOfWork.campbuildstgetotaldistarea || Strings.ZERO,
        cost: this.props.noticeOfWork.cbsfreclamationcost || Strings.ZERO,
      },
      ...cutLinesRow,
      {
        activity: "Exploration Surface Drilling",
        effectedArea: this.props.noticeOfWork.expsurfacedrilltotaldistarea || Strings.ZERO,
        cost: this.props.noticeOfWork.expsurfacedrillreclamationcost || Strings.ZERO,
      },
      {
        activity: "Mechanical Trenching / Test Pits",
        effectedArea: this.props.noticeOfWork.mechtrenchingtotaldistarea || Strings.ZERO,
        cost: this.props.noticeOfWork.mechtrenchingreclamationcost || Strings.ZERO,
      },
      ...placerRow,
      ...sandAndGravelRow,
      {
        activity: "Settling Ponds",
        effectedArea: this.props.noticeOfWork.pondstotaldistarea || Strings.ZERO,
        cost: this.props.noticeOfWork.pondsreclamationcost || Strings.ZERO,
      },
      ...bulkSamplesRow,
      ...undergroundExpRow,
      {
        activity: "Total:",
        footer: true,
        effectedArea: this.props.noticeOfWork.reclareasubtotal || Strings.EMPTY_FIELD,
        cost: this.props.noticeOfWork.reclcosttotal || Strings.EMPTY_FIELD,
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
              <p>{this.props.noticeOfWork.timbertotalvolume || Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <br />
          <Table
            align="left"
            pagination={false}
            columns={columns}
            dataSource={data}
            locale={{
              emptyText: "There is no reclamation data associated with this Notice of Work",
            }}
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
            <LinkButton
              onClick={() =>
                downloadNowDocument(record.key, record.application_guid, record.filename)
              }
            >
              <span>{text}</span>
            </LinkButton>
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

    const isSpatialFile = (document) =>
      document.documenttype === "SpatialFileDoc" ||
      (document.filename &&
        Object.keys(UNIQUELY_SPATIAL).includes(
          document.filename.substr(document.filename.length - 4)
        ));

    const transfromData = (documents, application_guid, spatial = false) =>
      documents
        .filter((document) => (spatial ? isSpatialFile(document) : !isSpatialFile(document)))
        .map((document) => ({
          key: document.id,
          application_guid,
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
              dataSource={transfromData(
                this.props.noticeOfWork.documents,
                this.props.noticeOfWork.application_guid
              )}
              locale={{ emptyText: "There are no documents associated with this Notice of Work" }}
            />
          ) : (
            <NullScreen type="documents" />
          )}
        </div>
        <br />
        <h3>Spatial Files</h3>
        <Divider />
        <div className="padding-large--sides">
          {this.props.noticeOfWork.documents.length >= 1 ? (
            <Table
              align="left"
              pagination={false}
              columns={columns}
              dataSource={transfromData(
                this.props.noticeOfWork.documents,
                this.props.noticeOfWork.application_guid,
                true
              )}
              locale={{
                emptyText: "There are no spacial files associated with this Notice of Work",
              }}
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
            <p>Unknown</p>
          </Col>
        </Row>
        {this.renderSummaryOfReclamation()}
        <NOWActivities noticeOfWork={this.props.noticeOfWork} />
        {this.renderDocuments()}
      </div>
    );
  }
}

NOWWorkPlan.propTypes = propTypes;
export default NOWWorkPlan;
