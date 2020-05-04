import React, { Component } from "react";
import PropTypes from "prop-types";
import { Select, Spin, Icon } from "antd";
import debounce from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { searchOrgBook, fetchOrgBookCredential } from "@common/actionCreators/partiesActionCreator";
import { getSearchOrgBookResponse, getOrgBookCredential } from "@common/selectors/partiesSelectors";

const propTypes = {
  searchOrgBook: PropTypes.func.isRequired,
  fetchOrgBookCredential: PropTypes.func.isRequired,
  searchOrgBookResponse: PropTypes.objectOf(PropTypes.any),
  orgBookCredential: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  searchOrgBookResponse: {},
  orgBookCredential: {},
};

export class OrgBookSearchField extends Component {
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.handleSearchDebounced = (value) => debounce(this.handleSearch(value), 800);
  }

  state = {
    options: [],
    isSearching: false,
    credential: {},
  };

  handleChange = () => {
    this.setState({
      isSearching: false,
    });
  };

  handleSelect = (value) => {
    this.setState({ credential: null });
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
    const linkClick = () =>
      window.open(
        `https://orgbook.gov.bc.ca/en/organization/${this.state.credential.topic.source_id}`,
        "_blank",
        "noreferrer"
      );
    return (
      <Select
        showSearch
        showArrow
        labelInValue
        placeholder="Start typing to search OrgBook..."
        notFoundContent={
          this.state.isSearching ? <Spin size="small" indicator={<Icon type="loading" />} /> : null
        }
        filterOption={false}
        onSearch={this.handleSearchDebounced}
        onChange={this.handleChange}
        onSelect={this.handleSelect}
        style={{ width: "100%" }}
        suffixIcon={
          this.state.credential &&
          this.state.credential.topic && (
            <a role="link" tabIndex={0} onClick={linkClick} onKeyDown={linkClick}>
              View on OrgBook
            </a>
          )
        }
      >
        {this.state.options.map((option) => (
          <Select.Option key={option.value}>{option.text}</Select.Option>
        ))}
      </Select>
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
    },
    dispatch
  );

OrgBookSearchField.propTypes = propTypes;
OrgBookSearchField.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(OrgBookSearchField);
