import React, { FC, ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col, Popover, Row, Tabs, TabsProps, Typography } from "antd";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CoreTag from "./CoreTag";

import CompanyIcon from "@mds/common/assets/icons/CompanyIcon";
import { faLocationDot } from "@fortawesome/pro-light-svg-icons";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";

interface BreadCrumb {
  route: string;
  text: string;
}

interface CommonPageHeaderProps {
  entityLabel: string;
  entityType: string;
  mineGuid: string;
  current_permittee: string; // would be ideal to get this from the mine
  breadCrumbs?: BreadCrumb[];
  // pass in either tabProps for tabbed view or pageContent for any styled content
  // do not use both
  tabProps?: TabsProps;
  pageContent?: ReactNode;
  extraElement?: ReactNode;
  additionalMines?: { mine_guid: string; mine_name: string }[];
}

const { Title, Text } = Typography;

const CommonPageHeader: FC<CommonPageHeaderProps> = ({
  mineGuid,
  current_permittee,
  entityLabel,
  entityType,
  breadCrumbs,
  tabProps,
  pageContent,
  extraElement,
  additionalMines,
}) => {
  const mine = useSelector(getMineById(mineGuid));
  const dispatch = useDispatch();

  useEffect(() => {
    if (!mine) {
      dispatch(fetchMineRecordById(mineGuid));
    }
  }, [mineGuid]);

  const headerClassname = pageContent ? "common-page-header common-page-header-no-tabs" : "common-page-header"

  return (
    <div className="common-page">
      <div className={`view--header padding-lg--top padding-lg--sides ${headerClassname}`}>
        <Row>
          <Col>
            {breadCrumbs.map((crumb) => {
              return (
                <React.Fragment key={crumb.route}>
                  <Link to={crumb.route} className="faded-text">
                    {crumb.text}
                  </Link>{" "}
                  /{" "}
                </React.Fragment>
              );
            })}
            <Text>
              {entityType} {entityLabel}
            </Text>
          </Col>
        </Row>
        <Row align="middle" gutter={16} justify="space-between">
          <Col>
            <Row align="middle" gutter={16}>
              <Col>
                <Title level={1} className="margin-none">
                  {entityType} {entityLabel}
                </Title>
              </Col>
              <Col>
                <CoreTag
                  icon={<FontAwesomeIcon icon={faLocationDot} />}
                  text={mine?.mine_name}
                  link={GLOBAL_ROUTES?.MINE_DASHBOARD.dynamicRoute(mineGuid)}
                  suffix={
                    additionalMines?.length > 0 ? (
                      <Popover
                        title="Associated Mines"
                        overlayStyle={{ maxWidth: 360 }}
                        overlayInnerStyle={{
                          border: "1px solid #d9d9d9",
                          borderRadius: 8,
                          boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                        }}
                        content={
                          <div>
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: "0.85em", display: "block", marginBottom: 12, fontStyle: "italic" }}
                            >
                              This permit applies to multiple mine sites due to historical amendments or operational grouping.
                            </Typography.Text>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                              {additionalMines.map((m) => (
                                <div key={m.mine_guid} style={{ display: "inline-block" }}>
                                  <CoreTag
                                    icon={<FontAwesomeIcon icon={faLocationDot} />}
                                    text={m.mine_name}
                                    link={GLOBAL_ROUTES?.MINE_DASHBOARD.dynamicRoute(m.mine_guid)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        }
                      >
                        <button
                          type="button"
                          aria-label={`Show ${additionalMines.length} more associated mines`}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            color: "inherit",
                            font: "inherit",
                            fontSize: "0.85em",
                            whiteSpace: "nowrap",
                            textDecoration: "underline",
                          }}
                        >
                          + {additionalMines.length} More
                        </button>
                      </Popover>
                    ) : undefined
                  }
                />
              </Col>
              {current_permittee && (
                <Col>
                  <CoreTag icon={<CompanyIcon />} text={current_permittee} />
                </Col>
              )}
            </Row>
          </Col>

          {extraElement && <Col className="core-header-extra">{extraElement}</Col>}
        </Row>
      </div>
      {tabProps && (
        <Tabs
          className="core-tabs fixed-tabs-tabs padding-md--top"
          {...tabProps}
          tabBarStyle={{ paddingLeft: 20, paddingRight: 20 }}
        />
      )}
      {pageContent && (
        <div className="fixed-page-content">
          {pageContent}
        </div>
      )}
    </div>
  );
};

export default CommonPageHeader;
