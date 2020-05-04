import React, { Component } from "react";
import PropTypes from "prop-types";
import { Row, Col, Form, Select, Spin, Icon, Button } from "antd";
import debounce, { isEmpty } from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  searchOrgBook,
  fetchOrgBookCredential,
  createPartyOrgBookEntity,
} from "@common/actionCreators/partiesActionCreator";
import { getSearchOrgBookResponse, getOrgBookCredential } from "@common/selectors/partiesSelectors";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  searchOrgBook: PropTypes.func.isRequired,
  fetchOrgBookCredential: PropTypes.func.isRequired,
  createPartyOrgBookEntity: PropTypes.func.isRequired,
  searchOrgBookResponse: PropTypes.objectOf(PropTypes.any),
  orgBookCredential: PropTypes.objectOf(PropTypes.any),
  party: CustomPropTypes.party.isRequired,
};

const defaultProps = {
  searchOrgBookResponse: null,
  orgBookCredential: null,
};

export class PartyOrgBookForm extends Component {
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.handleSearchDebounced = (value) => debounce(this.handleSearch(value), 800);
  }

  state = {
    options: [],
    credential: null,
    isSearching: false,
    isAssociating: false,
  };

  handleAssociateButtonClick = () => {
    this.setState({ isAssociating: true });
    this.props
      .createPartyOrgBookEntity(this.props.party.party_guid, {
        credential_id: this.state.credential.id,
      })
      .finally(() => {
        this.setState({ isAssociating: false });
      });
  };

  handleChange = () => {
    this.setState({
      isSearching: false,
    });
  };

  handleSelect = (value) => {
    const credentialId = value.key;
    this.props.fetchOrgBookCredential(credentialId).then(() => {
      this.setState({ credential: this.props.orgBookCredential });
    });
  };

  handleSearch(search) {
    if (search.length === 0) {
      return;
    }

    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    this.setState({ options: [], isSearching: true, credential: null });

    this.props.searchOrgBook(search).then(() => {
      if (fetchId !== this.lastFetchId) {
        return;
      }

      const results = this.props.searchOrgBookResponse || [];
      const selectOptions = results
        .filter((result) => result.names && result.names.length > 0)
        .map((result) => ({
          text: result.names[0].text,
          value: result.names[0].credential_id,
        }));
      this.setState({ options: selectOptions, isSearching: false });
    });
  }

  render() {
    const hasOrgBookCredential = !isEmpty(this.state.credential);

    return (
      <Row gutter={48}>
        <Col span={24}>
          <Row gutter={16}>
            <Col md={24} xs={24}>
              <h5>OrgBook Entity</h5>
              <p>
                This party has not been associated with an entity on OrgBook. To associate this
                party with an entity on OrgBook, search for the entity using the search below and
                select the&nbsp;
                <strong>Associate</strong> button.
              </p>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Search OrgBook">
                <Select
                  showSearch
                  showArrow
                  labelInValue
                  placeholder="Start typing to search OrgBook..."
                  notFoundContent={
                    this.state.isSearching ? (
                      <Spin size="small" indicator={<Icon type="loading" />} />
                    ) : null
                  }
                  filterOption={false}
                  onSearch={this.handleSearchDebounced}
                  onChange={this.handleChange}
                  onSelect={this.handleSelect}
                  style={{ width: "100%" }}
                  disabled={this.state.isAssociating}
                >
                  {this.state.options.map((option) => (
                    <Select.Option key={option.value}>{option.text}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Button
                type="secondary"
                className="full-mobile"
                href={
                  hasOrgBookCredential
                    ? `https://orgbook.gov.bc.ca/en/organization/${this.state.credential.topic.source_id}`
                    : null
                }
                target="_blank"
                disabled={!hasOrgBookCredential}
              >
                <Icon type="book" />
                View on OrgBook
              </Button>
              <Button
                type="primary"
                className="full-mobile"
                disabled={!hasOrgBookCredential}
                onClick={this.handleAssociateButtonClick}
                loading={this.state.isAssociating}
              >
                <span>
                  <Icon type="check-circle" className="padding-small--right" />
                  Associate
                </span>
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  searchOrgBookResponse: getSearchOrgBookResponse(state),
  orgBookCredential: getOrgBookCredential(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      searchOrgBook,
      fetchOrgBookCredential,
      createPartyOrgBookEntity,
    },
    dispatch
  );

PartyOrgBookForm.propTypes = propTypes;
PartyOrgBookForm.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(PartyOrgBookForm);
