import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router-dom";
import { Row, Col, Typography, Descriptions, Input } from "antd";
import "@ant-design/compatible/assets/index.css";
import PropTypes from "prop-types";
import { getMajorMinesApplicationStatusCodesHash } from "@common/selectors/staticContentSelectors";
import {
  fetchProjectById,
  updateMajorMineApplication,
} from "@common/actionCreators/projectActionCreator";
import { formatDate } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import { getProject } from "@common/selectors/projectSelectors";
import * as routes from "@/constants/routes";
import UpdateMajorMineAppStatusForm from "@/components/Forms/majorMineApplication/UpdateMajorMineAppStatusForm";
import CustomPropTypes from "@/customPropTypes";
import DocumentTable from "@/components/common/DocumentTable";
import ScrollSideMenu from "@/components/common/ScrollSideMenu";

const propTypes = {
  project: CustomPropTypes.project.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectGuid: PropTypes.string,
    }),
  }).isRequired,
  majorMineAppStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  updateMajorMineApplication: PropTypes.func.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
};

const menuOptions = [
  {
    href: "basic-information",
    title: "Basic Information",
  },
  {
    href: "primary-documents",
    title: "Primary Documents",
  },
  {
    href: "spatial-components",
    title: "Spatial Components",
  },
  {
    href: "supporting-documents",
    title: "Supporting Documents",
  },
  {
    href: "ministry-decision-documents",
    title: "Ministry Decision Documents",
  },
];

export class MajorMineApplicationTab extends Component {
  state = {
    fixedTop: false,
  };

  componentDidMount() {
    const { projectGuid } = this.props.match.params;
    this.props.fetchProjectById(projectGuid);
    window.addEventListener("scroll", this.handleScroll);
    this.handleScroll();
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll = () => {
    if (window.pageYOffset > 170 && !this.state.fixedTop) {
      this.setState({ fixedTop: true });
    } else if (window.pageYOffset <= 170 && this.state.fixedTop) {
      this.setState({ fixedTop: false });
    }
  };

  handleUpdateMMA = (event, values) => {
    event.preventDefault();
    const { projectGuid } = this.props.match.params;
    return this.props
      .updateMajorMineApplication(
        {
          projectGuid,
          majorMineApplicationGuid: this.props.project.major_mine_application
            .major_mine_application_guid,
        },
        values
      )
      .then(() => this.props.fetchProjectById(projectGuid));
  };

  renderDocumentSection = (
    sectionTitle,
    sectionHref,
    sectionDocuments,
    isApplicationFile = false
  ) => {
    const titleElement = isApplicationFile ? (
      <Typography.Text strong style={{ fontSize: "20px", textTransform: "uppercase" }}>
        {sectionTitle}
      </Typography.Text>
    ) : (
      <Typography.Title level={4}>{sectionTitle}</Typography.Title>
    );

    return (
      <div id={sectionHref}>
        {titleElement}
        <DocumentTable
          documents={sectionDocuments?.reduce(
            (docs, doc) => [
              {
                key: doc.mine_document_guid,
                mine_document_guid: doc.mine_document_guid,
                document_manager_guid: doc.document_manager_guid,
                name: doc.document_name,
                category: null,
                uploaded: doc.upload_date,
              },
              ...docs,
            ],
            []
          )}
          excludedColumnKeys={["dated", "category", "remove"]}
          additionalColumnProps={[{ key: "name", colProps: { width: "80%" } }]}
        />
      </div>
    );
  };

  render() {
    const { contacts, major_mine_application, project_guid } = this.props.project;

    const statusCode = major_mine_application?.status_code;
    const updateUser = major_mine_application?.update_user;
    const updateDate = formatDate(major_mine_application?.update_timestamp);

    const primaryContact = contacts?.find((c) => c.is_primary) || {};

    return (
      <>
        <div className={this.state.fixedTop ? "side-menu--fixed" : "side-menu"}>
          <ScrollSideMenu
            menuOptions={menuOptions}
            featureUrlRoute={routes.PROJECT_FINAL_APPLICATION.hashRoute}
            featureUrlRouteArguments={[project_guid]}
          />
        </div>
        <div
          className={
            this.state.fixedTop ? "side-menu--content with-fixed-top top-125" : "side-menu--content"
          }
        >
          <Row>
            <Col lg={18}>
              <UpdateMajorMineAppStatusForm
                initialValues={{
                  status_code: statusCode,
                }}
                displayValues={{
                  statusCode,
                  updateUser,
                  updateDate,
                  majorMineAppStatusCodesHash: this.props.majorMineAppStatusCodesHash,
                }}
                handleSubmit={this.handleUpdateMMA}
              />
            </Col>
          </Row>

          <Row id="basic-information">
            <Col lg={{ span: 14 }} xl={{ span: 16 }}>
              <Typography.Title level={3}>Basic Information</Typography.Title>
            </Col>
          </Row>
          <Row>
            <Col xs={24} md={12}>
              <Descriptions layout="vertical" colon={false} style={{ maxWidth: "95%" }}>
                <Descriptions.Item label="Primary Contact" className="vertical-description">
                  <Input value={primaryContact?.name || Strings.EMPTY_FIELD} disabled />
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} md={12}>
              <Descriptions layout="vertical" colon={false} style={{ maxWidth: "95%" }}>
                <Descriptions.Item label="Ministry Contact" className="vertical-description">
                  <Input
                    value={this.props.project?.project_lead_name || Strings.EMPTY_FIELD}
                    disabled
                  />
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          <Row>
            <Col xs={24} md={12}>
              <Descriptions layout="vertical" colon={false} style={{ maxWidth: "95%" }}>
                <Descriptions.Item label="Submitted" className="vertical-description">
                  <Input
                    value={formatDate(this.props.project.major_mine_application?.create_timestamp)}
                    disabled
                  />
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} md={12}>
              <Descriptions layout="vertical" colon={false} style={{ maxWidth: "95%" }}>
                <Descriptions.Item label="Status" className="vertical-description">
                  <Input
                    value={
                      this.props.majorMineAppStatusCodesHash[statusCode] || Strings.EMPTY_FIELD
                    }
                    disabled
                  />
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          <br />
          <Typography.Title level={4} id="major-mine-application">
            Application Files
          </Typography.Title>
          {this.renderDocumentSection(
            "Primary Documents",
            "primary-documents",
            this.props.project.major_mine_application?.documents?.filter(
              (doc) => doc.major_mine_application_document_type_code === "PRM"
            ) || [],
            true
          )}
          <br />
          {this.renderDocumentSection(
            "Spatial Components",
            "spatial-components",
            this.props.project.major_mine_application?.documents?.filter(
              (doc) => doc.major_mine_application_document_type_code === "SPT"
            ) || [],
            true
          )}
          <br />
          {this.renderDocumentSection(
            "Supporting Documents",
            "supporting-documents",
            this.props.project.major_mine_application?.documents?.filter(
              (doc) => doc.major_mine_application_document_type_code === "SPR"
            ) || [],
            true
          )}
          <br />
          {this.renderDocumentSection(
            "Minisrty Decision Documents",
            "ministry-decision-documents",
            [],
            true
          )}
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  project: getProject(state),
  majorMineAppStatusCodesHash: getMajorMinesApplicationStatusCodesHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateMajorMineApplication,
      fetchProjectById,
    },
    dispatch
  );

MajorMineApplicationTab.propTypes = propTypes;

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MajorMineApplicationTab));
