import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { PropTypes } from "prop-types";
import { Anchor } from "antd";

const { Link } = Anchor;

/**
 * @constant NOWSideMenu renders react children with an active indicator if the id is in the url.
 */

const propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
    replace: PropTypes.func,
    action: PropTypes.string,
  }).isRequired,
  location: PropTypes.shape({ hash: PropTypes.string }).isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  route: PropTypes.shape({ hashRoute: PropTypes.func }).isRequired,
};

export class NOWSideMenu extends Component {
  static onClickRoute = undefined;

  componentDidMount() {
    // Notes:
    // 1) Because of Keycloak authorization/redirection, props.location.hash will have extra params that we don't need, so ignore them.
    // e.g.: #blasting&state=bd74ea1c-09e5-4d7e-810f-d3558969293a&session_state=1c577088-15a8-4ae2-b1b7-12c424477364&code=2b...
    // 2) If the hash starts with "#state", it means there are no URL fragments (see params above in #1).
    // 3) If we want to start the user on the first section (the Application Info section), change "undefined" to "#application-info".
    let link =
      this.props.location &&
      this.props.location.hash &&
      !this.props.location.hash.startsWith("#state")
        ? this.props.location.hash
        : undefined;
    if (!link) {
      return;
    }
    link = link.substr(0, link.indexOf("&"));
    this.anchor.handleScrollTo(link);
    this.updateActiveLink(link);
  }

  handleAnchorOnClick = (e, link) => {
    e.preventDefault();
    this.updateActiveLink(link.href);
  };

  handleAnchorOnChange = (currentActiveLink) => {
    if (
      this.onClickRoute === undefined ||
      (this.props.history && this.props.history.action === "POP")
    ) {
      return;
    }
    this.props.history.replace(this.onClickRoute, { currentActiveLink });
  };

  updateActiveLink(link) {
    const { id } = this.props.match.params;
    this.onClickRoute = this.props.route.hashRoute(id, link);
    this.props.history.push(this.onClickRoute, { currentActiveLink: link });
  }

  render() {
    return (
      <div>
        <Anchor
          affix={false}
          offsetTop={195}
          onChange={this.handleAnchorOnChange}
          onClick={this.handleAnchorOnClick}
          ref={function(anchor) {
            this.anchor = anchor;
          }}
        >
          <Link href="#application-info" title="Application Info" />
          <Link href="#contacts" title="Contacts" />
          <Link href="#access" title="Access" />
          <Link href="#state-of-land" title="State of Land" />
          <Link href="#first-aid" title="First Aid" />
          <Link href="#reclamation" title="Summary of Reclamation" />
          <Link
            href="#access-roads"
            title="Access Roads, Trails, Helipads, Air Strips, Boat Ramps"
          />
          <Link href="#blasting" title="Blasting" />
          <Link href="#camps" title="Camps, Buildings, Staging Areas, Fuel/Lubricant Storage" />
          <Link
            href="#cut-lines-polarization-survey"
            title="Cut Lines and Induced Polarization Survey"
          />
          <Link href="#surface-drilling" title="Exploration Surface Drilling" />
          <Link href="#mechanical-trenching" title="Mechanical Trenching / Test Pits" />
          <Link href="#settling-ponds" title="Settling Ponds" />
          <Link href="#surface-bulk-samples" title="Surface Bulk Sample" />
          <Link href="#underground-exploration" title="Underground Exploration" />
          <Link href="#sand-gravel-quarry-operations" title="Sand and Gravel / Quarry Operations" />
          <Link href="#placer-operations" title="Placer Operations" />
          <Link href="#water-supply" title="Water Supply" />
          <Link href="#documents" title="Documents" />
        </Anchor>
      </div>
    );
  }
}

NOWSideMenu.propTypes = propTypes;

export default withRouter(NOWSideMenu);
