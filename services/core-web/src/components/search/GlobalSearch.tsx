import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Modal, Input, List, Typography, Button, Empty } from "antd";
import { SearchOutlined, FileSearchOutlined, EnterOutlined } from "@ant-design/icons";
import { throttle } from "lodash";
import { fetchSearchBarResults } from "@mds/common/redux/actionCreators/searchActionCreator";
import { getSearchBarResults } from "@mds/common/redux/reducers/searchReducer";
import * as router from "@/constants/routes";
import { MINE, PROFILE_NOCIRCLE, DOC } from "@/constants/assets";
import { ISearchResult, ISimpleSearchResult } from "@mds/common/interfaces";

const { Text } = Typography;

interface GlobalSearchProps {
    placeholder?: string;
    containerStyle?: React.CSSProperties;
    size?: "small" | "middle" | "large";
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
    placeholder = "Search Core...",
    containerStyle = {},
    size = "middle"
}) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const dispatch = useDispatch();
    const searchResults = useSelector(getSearchBarResults);
    const history = useHistory();
    const inputRef = useRef<any>(null);

    const handleOpen = () => {
        setIsModalVisible(true);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleClose = () => {
        setIsModalVisible(false);
        setSearchTerm("");
        setSelectedIndex(0);
    };

    // Keyboard shortcut to open search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                handleOpen();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const fetchResults = useCallback(
        throttle((term: string) => {
            if (term.length >= 2) {
                dispatch(fetchSearchBarResults(term));
            }
        }, 1000),
        [dispatch]
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        setSelectedIndex(0);
        fetchResults(value);
    };

    const navigateToResult = (item: ISearchResult<ISimpleSearchResult>) => {
        let routeUrl = "";
        switch (item.type) {
            case "mine":
                routeUrl = router.MINE_GENERAL.dynamicRoute(item.result.id);
                break;
            case "party":
                routeUrl = router.PARTY_PROFILE.dynamicRoute(item.result.id);
                break;
            case "permit":
                routeUrl = router.SEARCH_RESULTS.dynamicRoute({ q: item.result.value });
                break;
            default:
                break;
        }
        if (routeUrl) {
            history.push(routeUrl);
            handleClose();
        }
    };

    const handleEnter = () => {
        if (searchResults && searchResults.length > 0) {
            navigateToResult(searchResults[selectedIndex]);
        } else if (searchTerm.length > 0) {
            history.push(router.SEARCH_RESULTS.dynamicRoute({ q: searchTerm }));
            handleClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % (searchResults.length || 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + (searchResults.length || 1)) % (searchResults.length || 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            handleEnter();
        } else if (e.key === "Escape") {
            handleClose();
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "mine":
                return <img className="icon-svg-filter" src={MINE} alt="Mine" height={20} />;
            case "party":
                return <img className="icon-svg-filter" src={PROFILE_NOCIRCLE} alt="Contact" height={20} />;
            case "permit":
                return <img className="icon-svg-filter" src={DOC} alt="Permit" height={20} />;
            default:
                return <FileSearchOutlined />;
        }
    };

    return (
        <>
            <Button
                className="global-search-trigger"
                onClick={handleOpen}
                icon={<SearchOutlined />}
                size={size}
                style={{ width: "100%", textAlign: "left", color: "#bfbfbf", backgroundColor: "white", borderColor: "#d9d9d9", ...containerStyle }}
            >
                {placeholder} <span style={{ float: "right", fontSize: "12px", opacity: 0.7 }}>⌘K</span>
            </Button>

            <Modal
                visible={isModalVisible}
                onCancel={handleClose}
                footer={null}
                closable={false}
                maskClosable={true}
                className="global-search-modal"
                width={600}
                style={{ top: 50 }}
                bodyStyle={{ padding: 0 }}
            >
                <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0" }}>
                    <Input
                        ref={inputRef}
                        prefix={<SearchOutlined style={{ fontSize: "18px", color: "#bfbfbf" }} />}
                        placeholder="Search for mines, contacts, permits..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        bordered={false}
                        style={{ fontSize: "16px" }}
                        allowClear
                    />
                </div>

                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {searchTerm && searchResults && searchResults.length > 0 ? (
                        <List
                            itemLayout="horizontal"
                            dataSource={searchResults}
                            renderItem={(item, index) => (
                                <List.Item
                                    className={`search-result-item ${index === selectedIndex ? "selected" : ""}`}
                                    onClick={() => navigateToResult(item)}
                                    style={{
                                        padding: "12px 24px",
                                        cursor: "pointer",
                                        backgroundColor: index === selectedIndex ? "#e6f7ff" : "transparent"
                                    }}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <List.Item.Meta
                                        avatar={getIcon(item.type)}
                                        title={<Text strong={index === selectedIndex}>{item.result.value}</Text>}
                                        description={<Text type="secondary" style={{ fontSize: "12px" }}>{item.type.toUpperCase()}</Text>}
                                    />
                                    {index === selectedIndex && <EnterOutlined style={{ color: "#1890ff" }} />}
                                </List.Item>
                            )}
                        />
                    ) : searchTerm ? (
                        <div style={{ padding: "24px", textAlign: "center" }}>
                            <Empty description="No results found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            <Button type="link" onClick={() => {
                                history.push(router.SEARCH_RESULTS.dynamicRoute({ q: searchTerm }));
                                handleClose();
                            }}>
                                See all results for "{searchTerm}"
                            </Button>
                        </div>
                    ) : (
                        <div style={{ padding: "24px", color: "#bfbfbf", textAlign: "center" }}>
                            Type to start searching...
                        </div>
                    )}
                </div>
                <div style={{ padding: "8px 16px", background: "#fafafa", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#8c8c8c" }}>
                    <span><Text keyboard>↵</Text> to select</span>
                    <span><Text keyboard>↑↓</Text> to navigate</span>
                    <span><Text keyboard>esc</Text> to close</span>
                </div>
            </Modal>
        </>
    );
};

export default GlobalSearch;
