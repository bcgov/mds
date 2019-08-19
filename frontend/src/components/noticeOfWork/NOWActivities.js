/* eslint-disable */
import React, { Component } from "react";
import { Divider, Col, Row, Collapse, Icon, Table } from "antd";
import * as Strings from "@/constants/strings";
import { COLOR } from "@/constants/styles";
import { formatDate } from "@/utils/helpers";

const { Panel } = Collapse;

export class NOWActivities extends Component {
  renderAccess = () => {
    const columns = [
      {
        title: "Access Type",
        dataIndex: "accessType",
        key: "accessType",
        render: (text) => <div title="Access Type">{text}</div>,
      },
      {
        title: "Length(km)",
        dataIndex: "length",
        key: "length",
        render: (text) => <div title="Length(km)">{text}</div>,
      },
      {
        title: "Merchantable timber volume (m3)",
        dataIndex: "volume",
        key: "volume",
        render: (text) => <div title="Merchantable timber volume (m3)">{text}</div>,
      },
    ];
    return (
      <div className="padding-large--sides">
        <Table
          align="left"
          pagination={false}
          columns={columns}
          dataSource={[]}
          locale={{
            emptyText: "Unknown",
          }}
          footer={() => <div title="Total">Total:</div>}
        />
        <br />
        <h4>Bridges, Culverts, and Crossings</h4>
        <Divider className="margin-10" />
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Are you proposing any bridges, culverts, and crossings?</p>
          </Col>
          <Col md={3} xs={12}>
            <p>{"Unknown" || Strings.EMPTY_FIELD}</p>
          </Col>
          <Col md={9} xs={12}>
            <p>{"Unknown" || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <br />
        <h4>Reclamation Program</h4>
        <Divider className="margin-10" />
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">
              Describe the proposed reclamation and timing for this specific activity
            </p>
          </Col>
          <Col md={12} xs={24}>
            <p>{"Unknown" || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
      </div>
    );
  };

  renderBlasting = () => {
    return (
      <div className="padding-large--sides">
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">On Site Storage Explosive</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.storeexplosivesonsite || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title--light">Explosive Magazine Storage and Use Permit</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.bcexplosivespermitissued || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title--light">Permit Number</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.bcexplosivespermitnumber || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title--light">Expiry Date</p>
          </Col>
          <Col md={12} xs={24}>
            <p>
              {formatDate(this.props.noticeOfWork.bcexplosivespermitexpiry) || Strings.EMPTY_FIELD}
            </p>
          </Col>
        </Row>
      </div>
    );
  };

  renderCampsAndStorage = () => {
    const campColumns = [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (text) => <div title="Name">{text}</div>,
      },
      {
        title: "Number of People",
        dataIndex: "numPeople",
        key: "numPeople",
        render: (text) => <div title="Number of People">{text}</div>,
      },
      {
        title: "Number of Structures",
        dataIndex: "structures",
        key: "structures",
        render: (text) => <div title="Number of Structures">{text}</div>,
      },
      {
        title: "Estimated quantity of water (m3/s)",
        dataIndex: "waterQuality",
        key: "waterQuality",
        render: (text) => <div title="Estimated quantity of water (m3/s)">{text}</div>,
      },
      {
        title: "Disturbed Area (ha)",
        dataIndex: "disturbedArea",
        key: "disturbedArea",
        render: (text) => <div title="Disturbed Area (ha)">{text}</div>,
      },
      {
        title: "Merchantable timber volume (m3)",
        dataIndex: "timberVolume",
        key: "timberVolume",
        render: (text) => <div title="Merchantable timber volume (m3)">{text}</div>,
      },
    ];

    const buildingsColumns = [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (text) => <div title="Name">{text}</div>,
      },
      {
        title: "Disturbed Area (ha)",
        dataIndex: "disturbedArea",
        key: "disturbedArea",
        render: (text) => <div title="Disturbed Area (ha)">{text}</div>,
      },
      {
        title: "Merchantable timber volume (m3)",
        dataIndex: "timberVolume",
        key: "timberVolume",
        render: (text) => <div title="Merchantable timber volume (m3)">{text}</div>,
      },
    ];

    return (
      <div className="padding-large--sides">
        <div>
          <h4>Camps</h4>
          <Divider className="margin-10" />
          <Table
            align="left"
            pagination={false}
            columns={campColumns}
            dataSource={[]}
            locale={{
              emptyText: "Unknown",
            }}
            footer={() => "Total"}
          />
          <br />
        </div>
        <div>
          <h4>Buildings</h4>
          <Divider className="margin-10" />
          <Table
            align="left"
            pagination={false}
            columns={buildingsColumns}
            dataSource={[]}
            locale={{
              emptyText: "Unknown",
            }}
            footer={() => "Total"}
          />
          <br />
        </div>
        <div>
          <h4>Staging Area</h4>
          <Divider className="margin-10" />
          <Table
            align="left"
            pagination={false}
            columns={buildingsColumns}
            dataSource={[]}
            locale={{
              emptyText: "Unknown",
            }}
            footer={() => "Total"}
          />
          <br />
        </div>
        <div>
          <h4>Fuel</h4>
          <Divider className="margin-10" />
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">Do you propose to store fuel?</p>
            </Col>
            <Col md={12} xs={24}>
              <p>{this.props.noticeOfWork.fuellubstoreonsite || Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title--light">How much do you want to store?</p>
            </Col>
            <Col md={12} xs={24}>
              <p>{this.props.noticeOfWork.fuellubstored || Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">Storage Method</p>
            </Col>
            <Col md={12} xs={24}>
              <p>{this.props.noticeOfWork.fuellubstoremethodbulk || Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
        </div>
        <div>
          <h4>Reclamation Program</h4>
          <Divider className="margin-10" />
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">
                Describe the proposed reclamation and timing for this specific activity
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p>{"Unknown" || Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  renderLinesAndSurvey = () => {
    const columns = [
      {
        title: "Total Line (km)",
        dataIndex: "total",
        key: "total",
        render: (text) => <div title="Total Line (km)">{text}</div>,
      },
      {
        title: "Total Disturbed Area (ha)",
        dataIndex: "disturbedArea",
        key: "disturbedArea",
        render: (text) => <div title="Total Disturbed Area (ha)">{text}</div>,
      },
      {
        title: "Merchantable timber volume (m3)",
        dataIndex: "timberVolume",
        key: "timberVolume",
        render: (text) => <div title="Merchantable timber volume (m3)">{text}</div>,
      },
    ];

    const data = {
      total: this.props.noticeOfWork.cutlinesexplgridtotallinekms || Strings.EMPTY_FIELD,
      disturbedArea: "Unknown" || Strings.EMPTY_FIELD,
      timberVolume: this.props.cutlinesexplgridtimbervolume || Strings.EMPTY_FIELD,
    };
    return (
      <div className="padding-large--sides">
        <div>
          <h4>Exploration Grid</h4>
          <Divider className="margin-10" />
          <Table
            align="left"
            pagination={false}
            columns={columns}
            dataSource={[data]}
            locale={{
              emptyText: "No data",
            }}
          />
          <br />
        </div>
        <div>
          <h4>Reclamation Program</h4>
          <Divider className="margin-10" />
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">
                Describe the proposed reclamation and timing for this specific activity
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p>{this.props.noticeOfWork.cutlinesreclamation || Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  renderDrilling = () => {
    const columns = [
      {
        title: "Activity",
        dataIndex: "activity",
        key: "activity",
        render: (text) => <div title="Activity">{text}</div>,
      },
      {
        title: "Number of Sites",
        dataIndex: "numSites",
        key: "numSites",
        render: (text) => <div title="Number of Sites">{text}</div>,
      },
      {
        title: "Total Disturbance Area (ha)",
        dataIndex: "disturbedArea",
        key: "disturbedArea",
        render: (text) => <div title="Total Disturbed Area (ha)">{text}</div>,
      },
      {
        title: "Merchantable timber volume (m3)",
        dataIndex: "timberVolume",
        key: "timberVolume",
        render: (text) => <div title="Merchantable timber volume (m3)">{text}</div>,
      },
    ];

    return (
      <div className="padding-large--sides">
        <div>
          <h4>Drilling</h4>
          <Divider className="margin-10" />
          <Table
            align="left"
            pagination={false}
            columns={columns}
            dataSource={[]}
            locale={{
              emptyText: "Unknown",
            }}
          />
          <br />
        </div>
        <div>
          <h4>Support of the Drilling Program</h4>
          <Divider className="margin-10" />
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">The drilling program will be</p>
            </Col>
            <Col md={12} xs={24}>
              <p>{"Unknown" || Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
        </div>
        <div>
          <h4>Reclamation Program</h4>
          <Divider className="margin-10" />
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">
                Describe the proposed reclamation and timing for this specific activity
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p>{this.props.noticeOfWork.expsurfacedrillreclamation || Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  renderTrenching = () => {
    const columns = [
      {
        title: "Activity",
        dataIndex: "activity",
        key: "activity",
        render: (text) => <div title="Activity">{text}</div>,
      },
      {
        title: "Number of Sites",
        dataIndex: "numSites",
        key: "numSites",
        render: (text) => <div title="Number of Sites">{text}</div>,
      },
      {
        title: "Total Disturbance Area (ha)",
        dataIndex: "disturbedArea",
        key: "disturbedArea",
        render: (text) => <div title="Total Disturbance Area (ha)">{text}</div>,
      },
      {
        title: "Merchantable timber volume (m3)",
        dataIndex: "timberVolume",
        key: "timberVolume",
        render: (text) => <div title="Merchantable timber volume (m3)">{text}</div>,
      },
    ];
    return (
      <div className="padding-large--sides">
        <div>
          <h4>Trenching</h4>
          <Divider className="margin-10" />
          <Table
            align="left"
            pagination={false}
            columns={columns}
            dataSource={[]}
            locale={{
              emptyText: "Unknown",
            }}
          />
          <br />
        </div>
        <div>
          <h4>Reclamation Program</h4>
          <Divider className="margin-10" />
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">
                Describe the proposed reclamation and timing for this specific activity
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p>{this.props.noticeOfWork.mechtrenchingreclamation || Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">
                Estimated cost of reclamation of activities described above
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p>{this.props.mechtrenchingreclamationcost || Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  renderPonds = () => {
    const columns = [
      {
        title: "Pond ID",
        dataIndex: "id",
        key: "id",
        render: (text) => <div title="Pond ID">{text}</div>,
      },
      {
        title: "Width(m)",
        dataIndex: "width",
        key: "width",
        render: (text) => <div title="Width(m)">{text}</div>,
      },
      {
        title: "Length(m)",
        dataIndex: "length",
        key: "length",
        render: (text) => <div title="Length(m)">{text}</div>,
      },
      {
        title: "Disturbed Area (ha)",
        dataIndex: "disturbedArea",
        key: "disturbedArea",
        render: (text) => <div title="Disturbed Area (ha)">{text}</div>,
      },
      {
        title: "Merchantable timber volume (m3)",
        dataIndex: "timberVolume",
        key: "timberVolume",
        render: (text) => <div title="Merchantable timber volume (m3)">{text}</div>,
      },
    ];

    const transformData = (ponds) =>
      ponds.map((pond) => ({
        id: pond.pondid || Strings.EMPTY_FIELD,
        width: pond.width || Strings.EMPTY_FIELD,
        length: pond.length || Strings.EMPTY_FIELD,
        disturbedArea: pond.disturbedarea || Strings.EMPTY_FIELD,
        timberVolume: pond.timbervolume || Strings.EMPTY_FIELD,
      }));

    return (
      <div className="padding-large--sides">
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Describe waste water treatment</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.pondswastewatertreatfacility || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <br />
        <Table
          align="left"
          pagination={false}
          columns={columns}
          dataSource={transformData(this.props.noticeOfWork.existing_settling_pond)}
          locale={{
            emptyText: "No data",
          }}
        />
      </div>
    );
  };

  renderPlacerOperations = () => {
    const columns = [
      {
        title: "Activity",
        dataIndex: "activity",
        key: "activity",
        render: (text) => <div title="Activity">{text}</div>,
      },
      {
        title: "Number of Sites",
        dataIndex: "numSites",
        key: "numSites",
        render: (text) => <div title="Number of Sites">{text}</div>,
      },
      {
        title: "Total Disturbance Area (ha)",
        dataIndex: "disturbedArea",
        key: "disturbedArea",
        render: (text) => <div title="Total Disturbance Area (ha)">{text}</div>,
      },
      {
        title: "Merchantable timber volume (m3)",
        dataIndex: "timberVolume",
        key: "timberVolume",
        render: (text) => <div title="Merchantable timber volume (m3)">{text}</div>,
      },
    ];
    return (
      <div className="padding-large--sides">
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Is this an application for Underground Placer Operations?</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Is this an application for Hand Operations?</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <br />
        <Table
          align="left"
          pagination={false}
          columns={columns}
          dataSource={[]}
          locale={{
            emptyText: "No data",
          }}
        />
        <br />
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Proposed Production</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <h4>Total Planned Reclamation Area</h4>
        <Divider className="margin-10" />
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Total area of planned reclamation this year</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <h4>Changes In and About a Stream</h4>
        <Divider className="margin-10" />
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">
              Are you proposing a stream diversion into a different channel?
            </p>
          </Col>
          <Col md={12} xs={24}>
            <p>{Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <br />
        <div>
          <h4>Reclamation Program</h4>
          <Divider className="margin-10" />
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">
                Describe the proposed reclamation and timing for this specific activity
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p>{Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">
                Estimated cost of reclamation activities described above
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p>{Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  renderSandAndGravel = () => {
    const columns = [
      {
        title: "Activity",
        dataIndex: "activity",
        key: "activity",
        render: (text) => <div title="Activity">{text}</div>,
      },
      {
        title: "Number of Sites",
        dataIndex: "numSites",
        key: "numSites",
        render: (text) => <div title="Number of Sites">{text}</div>,
      },
      {
        title: "Total Disturbance Area (ha)",
        dataIndex: "disturbedArea",
        key: "disturbedArea",
        render: (text) => <div title="Total Disturbance Area (ha)">{text}</div>,
      },
      {
        title: "Merchantable timber volume (m3)",
        dataIndex: "timberVolume",
        key: "timberVolume",
        render: (text) => <div title="Merchantable timber volume (m3)">{text}</div>,
      },
    ];

    const transformData = (activities) =>
      activities.map((activity) => ({
        activity: activity.type || Strings.EMPTY_FIELD,
        numSites: "Unknown" || Strings.EMPTY_FIELD,
        disturbedArea: activity.disturbedarea || Strings.EMPTY_FIELD,
        timberVolume: activity.timbervolume || Strings.EMPTY_FIELD,
      }));

    return (
      <div className="padding-large--sides">
        <h4>Soil Conservation</h4>
        <Divider className="margin-10" />
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Average Depth Overburden(m)</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.sandgrvqrydepthoverburden || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Average Depth of top soil (m)</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.sandgrvqrydepthtopsoil || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">
              Measures to stabilize soil overburden stockpiles and control noxious weeds
            </p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.sandgrvqrystabilizemeasures || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <h4>Land Use</h4>
        <Divider className="margin-10" />
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Is this site within the Agricultural Land Reserve?</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.sandgrvqrywithinaglandres || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title--light">Permit Application Number</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.sandgrvqryalrpermitnumber || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Does the local government have a soil removal bylaw?</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.sandgrvqrylocalgovsoilrembylaw || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Official community plan for the site</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.sandgrvqryofficialcommplan || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Current land use zoning for the site</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.sandgrvqrylandusezoning || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Proposed end land use is</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.sandgrvqryendlanduse || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">
              Estimate total mineable reserves over the life of the mine
            </p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.sandgrvqrytotalmineres || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Estimate annual extraction from site</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.sandgrvqryannualextrest || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <br />
        <Table
          align="left"
          pagination={false}
          columns={columns}
          dataSource={transformData(this.props.noticeOfWork.sand_grv_qry_activity)}
          locale={{
            emptyText: "No data",
          }}
          footer={() => "Total"}
        />
        <br />
      </div>
    );
  };

  renderSurfaceBulkSample = () => {
    const columns = [
      {
        title: "Activity",
        dataIndex: "activity",
        key: "activity",
        render: (text) => <div title="Activity">{text}</div>,
      },
      {
        title: "QTY",
        dataIndex: "qty",
        key: "qty",
        render: (text) => <div title="QTY">{text}</div>,
      },
      {
        title: "Total Disturbance Area (ha)",
        dataIndex: "disturbedArea",
        key: "disturbedArea",
        render: (text) => <div title="Total Disturbance Area (ha)">{text}</div>,
      },
      {
        title: "Merchantable timber volume (m3)",
        dataIndex: "timberVolume",
        key: "timberVolume",
        render: (text) => <div title="Merchantable timber volume (m3)">{text}</div>,
      },
    ];

    const transformData = (activities) =>
      activities.map((activity) => ({
        activity: "Unknown" || Strings.EMPTY_FIELD,
        qty: "Unknown" || Strings.EMPTY_FIELD,
        disturbedArea: activity.disturbedarea || Strings.EMPTY_FIELD,
        timberVolume: activity.timbervolume || Strings.EMPTY_FIELD,
      }));

    return (
      <div className="padding-large--sides">
        <Table
          align="left"
          pagination={false}
          columns={columns}
          dataSource={transformData(this.props.noticeOfWork.surface_bulk_sample_activity)}
          locale={{
            emptyText: "No data",
          }}
        />
        <br />
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Processing Methods</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.surfacebulksampleprocmethods || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Bed Rock Expansion</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{"Unknown" || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <br />
        <h4>Reclamation Program</h4>
        <Divider className="margin-10" />
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">
              Describe the proposed reclamation and timing for this specific activity
            </p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.surfacebulksamplereclamation || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Spontaneous Combustion</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{"Unknown" || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Surface Water Damage</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{"Unknown" || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <br />
      </div>
    );
  };

  renderUnderGround = () => {
    const underGroundGolumns = [
      {
        title: "Activity",
        dataIndex: "activity",
        key: "activity",
        render: (text) => <div title="Activity">{text}</div>,
      },
      {
        title: "Quantity",
        dataIndex: "quantity",
        key: "quantity",
        render: (text) => <div title="Quantity">{text}</div>,
      },
      {
        title: "Incline",
        dataIndex: "incline",
        key: "incline",
        render: (text) => <div title="Incline">{text}</div>,
      },
      {
        title: "Units",
        dataIndex: "units",
        key: "units",
        render: (text) => <div title="Units">{text}</div>,
      },
      {
        title: "Width(m)",
        dataIndex: "width",
        key: "width",
        render: (text) => <div title="Width(m)">{text}</div>,
      },
      {
        title: "Length(m)",
        dataIndex: "length",
        key: "length",
        render: (text) => <div title="Length(m)">{text}</div>,
      },
    ];

    const transformUnderGroundData = (activities) =>
      activities.map((activity) => ({
        activity: "Unknown" || Strings.EMPTY_FIELD,
        quantity: activity.quantity || Strings.EMPTY_FIELD,
        incline: activity.incline || Strings.EMPTY_FIELD,
        units: activity.inclineunits || Strings.EMPTY_FIELD,
        width: activity.width || Strings.EMPTY_FIELD,
        length: activity.length || Strings.EMPTY_FIELD,
      }));

    const surfaceColumns = [
      {
        title: "Activity",
        dataIndex: "activity",
        key: "activity",
        render: (text) => <div title="Activity">{text}</div>,
      },
      {
        title: "Quantity",
        dataIndex: "quantity",
        key: "quantity",
        render: (text) => <div title="Quantity">{text}</div>,
      },
      {
        title: "Disturbed Area (ha)",
        dataIndex: "disturbedArea",
        key: "disturbedArea",
        render: (text) => <div title="Disturbed Area (ha)">{text}</div>,
      },
      {
        title: "Merchantable timber volume (m3)",
        dataIndex: "timberVolume",
        key: "timberVolume",
        render: (text) => <div title="Merchantable timber volume (m3)">{text}</div>,
      },
    ];

    const transformSurfaceData = (activities) =>
      activities.map((activity) => ({
        activity: "Unknown" || Strings.EMPTY_FIELD,
        quantity: activity.quantity || Strings.EMPTY_FIELD,
        disturbedArea: activity.disturbedarea || Strings.EMPTY_FIELD,
        timberVolume: activity.timbervolume || Strings.EMPTY_FIELD,
      }));

    return (
      <div className="padding-large--sides">
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Proposed Activities</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{"Unknown" || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <h4>New Underground Exploration Development</h4>
        <Divider className="margin-10" />
        <Table
          align="left"
          pagination={false}
          columns={underGroundGolumns}
          dataSource={transformUnderGroundData(this.props.noticeOfWork.under_exp_new_activity)}
          locale={{
            emptyText: "No data",
          }}
        />
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Total Ore</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.underexptotalore || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Total Waste</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{this.props.noticeOfWork.underexptotalwaste || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <br />
        <h4>Rehab Underground Exploration Development</h4>
        <Divider className="margin-10" />
        <Table
          align="left"
          pagination={false}
          columns={underGroundGolumns}
          dataSource={transformUnderGroundData(this.props.noticeOfWork.under_exp_rehab_activity)}
          locale={{
            emptyText: "No data",
          }}
        />
        <br />
        <h4>Surface Disturbance</h4>
        <Divider className="margin-10" />
        <Table
          align="left"
          pagination={false}
          columns={surfaceColumns}
          dataSource={transformSurfaceData(this.props.noticeOfWork.under_exp_surface_activity)}
          locale={{
            emptyText: "No data",
          }}
          footer={() => "Total"}
        />
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Total Ore</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{"Unknown" || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Total Waste</p>
          </Col>
          <Col md={12} xs={24}>
            <p>{"Unknown" || Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <br />
      </div>
    );
  };

  renderWaterSupply = () => {
    const columns = [
      {
        title: "Source",
        dataIndex: "source",
        key: "source",
        render: (text) => <div title="Source">{text}</div>,
      },
      {
        title: "Activity",
        dataIndex: "activity",
        key: "activity",
        render: (text) => <div title="Activity">{text}</div>,
      },
      {
        title: "Water Use",
        dataIndex: "waterUse",
        key: "waterUse",
        render: (text) => <div title="Water Use">{text}</div>,
      },
      {
        title: "Estimated Rate (m3/s)",
        dataIndex: "estimatedRate",
        key: "estimatedRate",
        render: (text) => <div title="Estimated Rate (m3/s)">{text}</div>,
      },
    ];

    const transformData = (activities) =>
      activities.map((activity) => ({
        source: activity.sourcewatersupply || Strings.EMPTY_FIELD,
        activity: "Unknown" || Strings.EMPTY_FIELD,
        waterUse: activity.useofwater || Strings.EMPTY_FIELD,
        estimatedRate: activity.estimateratewater || Strings.EMPTY_FIELD,
      }));

    return (
      <div className="padding-large--sides">
        <Table
          align="left"
          pagination={false}
          columns={columns}
          dataSource={transformData(this.props.noticeOfWork.water_source_activity)}
          locale={{
            emptyText: "No data",
          }}
        />
        <br />
      </div>
    );
  };

  render() {
    return (
      <div>
        <br />
        <h3>Activities</h3>
        <Divider className="margin-10" />
        <div className="padding-large--sides">
          <Collapse
            style={{
              backgroundColor: COLOR.lightGrey,
              border: `1px solid ${COLOR.backgroundWhite}`,
            }}
            expandIconPosition="right"
            expandIcon={({ isActive }) =>
              isActive ? <Icon type="minus-square" /> : <Icon type="plus-square" />
            }
          >
            <Panel header="Access Roads, trails, Help Pads, Air Strips, Boat Ramps" key="1">
              {this.renderAccess()}
            </Panel>
            <Panel header="Blasting" key="2">
              {this.renderBlasting()}
            </Panel>
            <Panel header="Camps, Buildings, Staging Area, Fuel/Lubricant Storage" key="3">
              {this.renderCampsAndStorage()}
            </Panel>
            <Panel header="Cut Lines and Induced Polarization Survey" key="4">
              {this.renderLinesAndSurvey()}
            </Panel>
            <Panel header="Exploration Surface Drilling" key="5">
              {this.renderDrilling()}
            </Panel>
            <Panel header="Mechanical Trenching / Test Pits" key="6">
              {this.renderTrenching()}
            </Panel>
            <Panel header="Placer Operations" key="7">
              {this.renderPlacerOperations()}
            </Panel>
            <Panel header="Sand and Gravel / Quarry Operations" key="8">
              {this.renderSandAndGravel()}
            </Panel>
            <Panel header="Settling Ponds" key="9">
              {this.renderPonds()}
            </Panel>
            <Panel header="Surface Bulk Sample" key="10">
              {this.renderSurfaceBulkSample()}
            </Panel>
            <Panel header="Underground Exploration" key="11">
              {this.renderUnderGround()}
            </Panel>
            <Panel header="Water Supply" key="12">
              {this.renderWaterSupply()}
            </Panel>
          </Collapse>
        </div>
      </div>
    );
  }
}

export default NOWActivities;
