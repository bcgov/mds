import React, { Component } from "react";
import { Divider, Col, Row, Collapse, Icon, Table } from "antd";
import * as Strings from "@/constants/strings";
import { COLOR } from "@/constants/styles";

const { Panel } = Collapse;
const recColumns = [
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

export class NOWActivities extends Component {
  renderAccess = () => {
    return (
      <div className="padding-large--sides">
        <Table
          align="left"
          pagination={false}
          columns={recColumns}
          dataSource={[]}
          locale={{
            emptyText: "No data",
          }}
          footer={() => "Total"}
        />
        <br />
        <h4>Bridges, Culverts, and Crossings</h4>
        <Divider />
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Are you proposing any bridges, culverts, and crossings?</p>
          </Col>
          <Col md={3} xs={12}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
          <Col md={9} xs={12}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <br />
        <h4>Reclamation Program</h4>
        <Divider />
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">
              Describe the proposed reclamation and timing for this specific activity
            </p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
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
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title--light">Explosive Magazine Storage and Use Permit</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title--light">Permit Number</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title--light">Expiry Date</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
      </div>
    );
  };

  renderCampsAndStorage = () => {
    return (
      <div className="padding-large--sides">
        <div>
          <h4>Camps</h4>
          <Divider />
          <Table
            align="left"
            pagination={false}
            columns={recColumns}
            dataSource={[]}
            locale={{
              emptyText: "No data",
            }}
            footer={() => "Total"}
          />
          <br />
        </div>
        <div>
          <h4>Buildings</h4>
          <Divider />
          <Table
            align="left"
            pagination={false}
            columns={recColumns}
            dataSource={[]}
            locale={{
              emptyText: "No data",
            }}
            footer={() => "Total"}
          />
          <br />
        </div>
        <div>
          <h4>Staging Area</h4>
          <Divider />
          <Table
            align="left"
            pagination={false}
            columns={recColumns}
            dataSource={[]}
            locale={{
              emptyText: "No data",
            }}
            footer={() => "Total"}
          />
          <br />
        </div>
        <div>
          <h4>Fuel</h4>
          <Divider />
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">Do you propose to store fuel?</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title--light">How much do you want to store?</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">Storage Method</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
        </div>
        <div>
          <h4>Reclamation Program</h4>
          <Divider />
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">
                Describe the proposed reclamation and timing for this specific activity
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  renderLinesAndSurvey = () => {
    return (
      <div className="padding-large--sides">
        <div>
          <h4>Exploration Grid</h4>
          <Divider />
          <Table
            align="left"
            pagination={false}
            columns={recColumns}
            dataSource={[]}
            locale={{
              emptyText: "No data",
            }}
          />
          <br />
        </div>
        <div>
          <h4>Reclamation Program</h4>
          <Divider />
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">
                Describe the proposed reclamation and timing for this specific activity
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  renderDrilling = () => {
    return (
      <div className="padding-large--sides">
        <div>
          <h4>Drilling</h4>
          <Divider />
          <Table
            align="left"
            pagination={false}
            columns={recColumns}
            dataSource={[]}
            locale={{
              emptyText: "No data",
            }}
          />
          <br />
        </div>
        <div>
          <h4>Support of the Drilling Program</h4>
          <Divider />
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">The drilling program will be</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
        </div>
        <div>
          <h4>Reclamation Program</h4>
          <Divider />
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">
                Describe the proposed reclamation and timing for this specific activity
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  renderTrenching = () => {
    return (
      <div className="padding-large--sides">
        <div>
          <h4>Trenching</h4>
          <Divider />
          <Table
            align="left"
            pagination={false}
            columns={recColumns}
            dataSource={[]}
            locale={{
              emptyText: "No data",
            }}
          />
          <br />
        </div>
        <div>
          <h4>Reclamation Program</h4>
          <Divider />
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">
                Describe the proposed reclamation and timing for this specific activity
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">
                Estimated cost of reclamation of activities described above
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  renderPonds = () => {
    return (
      <div className="padding-large--sides">
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Describe waste water treatment</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <br />
        <Table
          align="left"
          pagination={false}
          columns={recColumns}
          dataSource={[]}
          locale={{
            emptyText: "No data",
          }}
        />
      </div>
    );
  };

  renderPlacerOperations = () => {
    return (
      <div className="padding-large--sides">
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Is this an application for Underground Placer Operations?</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Is this an application for Hand Operations?</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <br />
        <Table
          align="left"
          pagination={false}
          columns={recColumns}
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
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <h4 className="h4">Total Planned Reclamation Area</h4>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Total area of planned reclamation this year</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <h4 className="h4">Changes In and About a Stream</h4>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">
              Are you proposing a stream diversion into a different channel?
            </p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <br />
        <div>
          <h4>Reclamation Program</h4>
          <Divider />
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">
                Describe the proposed reclamation and timing for this specific activity
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">
                Estimated cost of reclamation activities described above
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  renderSandAndGravel = () => {
    return (
      <div className="padding-large--sides">
        <h4 className="h4">Soil Conservation</h4>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Average Depth Overburden(m)</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Average Depth of top soil (m)</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">
              Measures to stabilize soil overburden stockpiles and control noxious weeds
            </p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <h4 className="h4">Land Use</h4>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Is this site within the Agricultural Land Reserve?</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title--light">Permit Application Number</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Does the local government have a soil removal bylaw?</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Official community plan for the site</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Current land use zoning for the site</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Proposed end land use is</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">
              Estimate total mineable reserves over the life of the mine
            </p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Estimate annual extraction from site</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <br />
        <Table
          align="left"
          pagination={false}
          columns={recColumns}
          dataSource={[]}
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
    return (
      <div className="padding-large--sides">
        <Table
          align="left"
          pagination={false}
          columns={recColumns}
          dataSource={[]}
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
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Bed Rock Expansion</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <br />
        <h4>Reclamation Program</h4>
        <Divider />
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">
              Describe the proposed reclamation and timing for this specific activity
            </p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Spontaneous Combustion</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Surface Water Damage</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <br />
      </div>
    );
  };

  renderUnderGround = () => {
    return (
      <div className="padding-large--sides">
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Proposed Activities</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <h4>New Underground Exploration Development</h4>
        <Divider />
        <Table
          align="left"
          pagination={false}
          columns={recColumns}
          dataSource={[]}
          locale={{
            emptyText: "No data",
          }}
        />
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Total Ore</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Total Waste</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <br />
        <h4>Rehab Underground Exploration Development</h4>
        <Divider />
        <Table
          align="left"
          pagination={false}
          columns={recColumns}
          dataSource={[]}
          locale={{
            emptyText: "No data",
          }}
        />
        <br />
        <h4>Surface Disturbance</h4>
        <Divider />
        <Table
          align="left"
          pagination={false}
          columns={recColumns}
          dataSource={[]}
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
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <p className="field-title">Total Waste</p>
          </Col>
          <Col md={12} xs={24}>
            <p> {Strings.EMPTY_FIELD}</p>
          </Col>
        </Row>
        <br />
      </div>
    );
  };

  renderWaterSupply = () => {
    return (
      <div className="padding-large--sides">
        <Table
          align="left"
          pagination={false}
          columns={recColumns}
          dataSource={[]}
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
        <Divider />
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
