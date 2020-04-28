import { BellOutlined } from '@ant-design/icons';
import { Badge, Spin, Tabs } from 'antd';
import useMergeValue from 'use-merge-value';
import React from 'react';
import classNames from 'classnames';
import NoticeList, { NoticeIconTabProps } from './NoticeList';

import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

const { TabPane } = Tabs;

const propTypes = {
    count: PropTypes.number,
    // bell?: React.ReactNode;
    // className?: string,
    loading: PropTypes.boolean,
    // onClear?: PropTypes.func,
    // onItemClick?: (item: NoticeIconData, tabProps: NoticeIconTabProps) => void;
    // onViewMore?: (tabProps: NoticeIconTabProps, e: MouseEvent) => void;
    // onTabChange?: (tabTile: string) => void;
    // style?: React.CSSProperties;
    // onPopupVisibleChange?: (visible: boolean) => void;
    popupVisible: PropTypesboolean,
    clearText: PropTypes.string,
    viewMoreText: PropTypes.string,
    clearClose: PropTypes.boolean,
    emptyImage: PropTypes.string,
    children: PropTypes.Array,

    userInfo: PropTypes.shape({ preferred_username: PropTypes.string.isRequired }).isRequired,
    activeButton: PropTypes.string.isRequired,
    fetchNotifications: PropTypes.func.isRequired,
    currentNotifications: PropTypes.arrayOf(PropTypes.string)
};

const defaultProps = {
    currentNotifications: ['Test', 'Notifications'],
    emptyImage: 'https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg',
};

export class NoticeIcon extends Component {

    notificationsBox = (loading, etc) => {
        return (<Spin spinning={loading} delay={300}>
            <Tabs className={styles.tabs} onChange={onTabChange}>
                {panes}
            </Tabs>
        </Spin>)
    }

    render() {
        if (this.props.loading) return this.notificationsBox

        return (
            <HeaderDropdown
                placement="bottomRight"
                overlay={notificationBox}
                overlayClassName={styles.popover}
                trigger={['click']}
                visible={visible}
                onVisibleChange={setVisible}
            >
                {trigger}
            </HeaderDropdown>
        )

    }
    const getNotificationBox = (): React.ReactNode => {
        const {
            children,
            loading,
            onClear,
            onTabChange,
            onItemClick,
            onViewMore,
            clearText,
            viewMoreText,
        } = props;
        if (!children) {
            return null;
        }
        const panes: React.ReactNode[] = [];
        React.Children.forEach(children, (child: React.ReactElement<NoticeIconTabProps>): void => {
            if (!child) {
                return;
            }
            const { list, title, count, tabKey, showClear, showViewMore } = child.props;
            const len = list && list.length ? list.length : 0;
            const msgCount = count || count === 0 ? count : len;
            const tabTitle: string = msgCount > 0 ? `${title} (${msgCount})` : title;
            panes.push(
                <TabPane tab={tabTitle} key={tabKey}>
                    <NoticeList
                        clearText={clearText}
                        viewMoreText={viewMoreText}
                        data={list}
                        onClear={(): void => onClear && onClear(title, tabKey)}
                        onClick={(item): void => onItemClick && onItemClick(item, child.props)}
                        onViewMore={(event): void => onViewMore && onViewMore(child.props, event)}
                        showClear={showClear}
                        showViewMore={showViewMore}
                        title={title}
                        {...child.props}
                    />
                </TabPane>,
            );
        });
        return (

        );
    };

        const { className, count, bell } = props;

const [visible, setVisible] = useMergeValue<boolean>(false, {
    value: props.popupVisible,
    onChange: props.onPopupVisibleChange,
});
const noticeButtonClass = classNames(className, styles.noticeButton);
const notificationBox = getNotificationBox();
const NoticeBellIcon = bell || <BellOutlined className={styles.icon} />;
const trigger = (
    <span className={classNames(noticeButtonClass, { opened: visible })}>
        <Badge count={count} style={{ boxShadow: 'none' }} className={styles.badge}>
            {NoticeBellIcon}
        </Badge>
    </span>
);
if (!notificationBox) {
    return trigger;
}

render()
{
    return (

    );
}; 
   



}

NoticeIcon.Tab = NoticeList;


export default NoticeIcon;
