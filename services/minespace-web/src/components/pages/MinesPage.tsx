import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import EnvironmentOutlined from "@ant-design/icons/EnvironmentOutlined";
import { Row, Col, Divider, Typography, Button, Skeleton } from "antd";
import { Link } from "react-router-dom";
import { getUserInfo, isProponent } from "@mds/common/redux/selectors/authenticationSelectors";
import { getUserMinePageData } from "@/selectors/userMineSelectors";
import { fetchUserMineInfo } from "@/actionCreators/userDashboardActionCreator";
import * as routes from "@/constants/routes";
import * as Strings from "@/constants/strings";
import Map from "@/components/common/Map";
import UnauthenticatedNotice from "../common/UnauthenticatedNotice";
import { IMine, detectDevelopmentEnvironment } from "@mds/common";

const DEFAULT_MINES_PER_PAGE = 10;
const DEFAULT_MINE_PAGE = 1;

export const MinesPage = () => {
  const dispatch = useDispatch();
  const minePageData = useSelector(getUserMinePageData);
  const userIsProponent = useSelector(isProponent);
  const userInfo = useSelector(getUserInfo);

  const [isLoaded, setIsLoaded] = useState(false);
  const [desiredPage, setDesiredPage] = useState(DEFAULT_MINE_PAGE);

  const per_page = DEFAULT_MINES_PER_PAGE;
  const { mines, current_page, total, total_pages } = minePageData;
  const isProdOrTest = !detectDevelopmentEnvironment();
  const isUnauthenticated = !userIsProponent && isProdOrTest;

  useEffect(() => {
    // for "Can't perform a React state update on an unmounted component."
    let isMounted = true;
    setIsLoaded(false);
    const queryParams = `?page=${desiredPage}&per_page=${per_page}`;
    dispatch(fetchUserMineInfo(queryParams)).then(() => {
      if (isMounted) {
        setIsLoaded(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [desiredPage]);

  return isUnauthenticated ? (
    <UnauthenticatedNotice />
  ) : (
    <Row>
      <Col span={24}>
        <Typography.Title>My Mines</Typography.Title>
        <Divider />

        <Typography.Title level={4}>Welcome, {userInfo.preferred_username}.</Typography.Title>

        <Skeleton loading={!isLoaded}>
          {(mines && mines.length > 0 && (
            <Row gutter={32}>
              <Col xl={12} lg={14} sm={24}>
                <Typography.Paragraph>
                  You are authorized to submit information for the following mines:
                </Typography.Paragraph>
                <div className="link-card">
                  <ul>
                    {mines
                      .sort((a, b) => (a.mine_name > b.mine_name ? 1 : -1))
                      .map((mine: IMine) => (
                        <li key={mine.mine_guid}>
                          <Link to={routes.MINE_DASHBOARD.dynamicRoute(mine.mine_guid)}>
                            <Typography.Title level={4}>
                              <EnvironmentOutlined style={{ paddingRight: "5px" }} />
                              {mine.mine_name}
                            </Typography.Title>
                            <Typography.Text>
                              Mine Number: {mine.mine_no || Strings.EMPTY_FIELD}
                            </Typography.Text>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              </Col>
              <Col xl={12} lg={10} sm={0}>
                <div style={{ height: "400px", marginTop: "-32px" }}>
                  <Map
                    controls={false}
                    additionalPins={mines.map((mine) => [mine.latitude, mine.longitude])}
                  />
                </div>
                <Typography.Paragraph style={{ paddingTop: "16px" }}>
                  Don&apos;t see the mine you&apos;re looking for? Contact&nbsp;
                  <a href={`mailto:${Strings.MDS_EMAIL}`}>{Strings.MDS_EMAIL}</a>
                  &nbsp;for assistance.
                </Typography.Paragraph>
              </Col>
            </Row>
          )) || (
            <Row>
              <Col span={24}>
                <Typography.Paragraph>
                  You are not authorized to manage information for any mines. Please contact&nbsp;
                  <a className="underline" href={Strings.MDS_EMAIL}>
                    {Strings.MDS_EMAIL}
                  </a>
                  &nbsp;for assistance.
                </Typography.Paragraph>
              </Col>
            </Row>
          )}
        </Skeleton>
        {true && (
          <>
            <Row justify="space-between">
              <Button
                onClick={() => setDesiredPage(current_page - 1)}
                disabled={desiredPage <= DEFAULT_MINE_PAGE}
                loading={!isLoaded}
              >
                Previous
              </Button>
              <Button
                disabled={desiredPage >= total_pages}
                onClick={() => setDesiredPage(current_page + 1)}
                loading={!isLoaded}
              >
                Next
              </Button>
            </Row>
            Viewing page {current_page} of {total_pages} ({total} mines)
          </>
        )}
      </Col>
    </Row>
  );
};

export default MinesPage;
