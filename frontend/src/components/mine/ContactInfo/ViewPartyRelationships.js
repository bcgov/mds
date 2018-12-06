import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Card, Row, Col, Select } from "antd";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";

import { fetchPartyRelationshipTypes } from "@/actionCreators/partiesActionCreator";
import { getPartyRelationshipTypes } from "@/selectors/partiesSelectors";

const propTypes = {
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handlePartySubmit: PropTypes.func.isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  partyRelationshipTypes: PropTypes.array.isRequired,
  partyTypeOptions: PropTypes.array.isRequired,
};

const defaultProps = {
  partyTypeOptions: [
    {
      value: "EoR",
      label: "Engineer on Record",
    },
    {
      value: "MM",
      label: "Mine Manager",
    },
  ],
};

export class ViewPermittee extends Component {
  componentDidMount() {
    this.props.fetchPartyRelationshipTypes();
  }

  onSubmitAddPartyRelationship = (values) => {
    this.props
      .addPartyRelationship(
        this.props.mine.guid,
        values.mineManager,
        this.props.mine.mine_detail[0].mine_name,
        values.startDate
      )
      .then(() => {
        this.props.fetchMineRecordById(this.props.mine.guid);
        this.props.closeModal();
      });
  };

  onPartySubmit = (values) => {
    this.props.handlePartySubmit(values, ModalContent.PERSON);
  };

  openAddPartyRelationshipModal = (value, onSubmit, handleChange, onPartySubmit, title) => {
    this.props.openModal({
      props: {
        onSubmit,
        handleChange,
        onPartySubmit,
        title: `${title  }: ${  this.props.partyTypeOptions.find((x) => x.value === value).label}`,
        partyType: value,
      },
      content: modalConfig.ADD_PARTY_RELATIONSHIP,
    });
  };

  render() {

    return (
      <div>
        <Card>
          <Row gutter={16}>
            <Col span={6}>
              <Select
                id="addContactSelect"
                onChange={(value) => {
                  this.openAddPartyRelationshipModal(
                    value,
                    this.onSubmitAddPartyRelationship,
                    this.props.handleChange,
                    this.onPartySubmit,
                    ModalContent.ADD_CONTACT
                  );
                  this.value = null;
                }}
                style={{ width: "100%" }}
                placeholder="Add a Contact"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {this.props.partyTypeOptions.map((value) => (
                  <Select.Option key={value.value} value={value.value}>
                    {value.label}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
          <br />
          <Row gutter={16}>
            <Col span={6}>
              <h3 />
            </Col>
            <Col span={6}>
              <h3 />
            </Col>
            <Col span={6}>
              <h3 />
            </Col>
            <Col span={6}>
              <h3 />
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
    partyRelationshipTypes: getPartyRelationshipTypes(state),
  });

const mapDispatchToProps = (dispatch) => bindActionCreators(
    {
      fetchPartyRelationshipTypes,
    },
    dispatch
  );

ViewPermittee.propTypes = propTypes;
ViewPermittee.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewPermittee);
