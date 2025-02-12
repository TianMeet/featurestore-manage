import {
    Space,
    Table,
    Button,
    Pagination,
    message,
    Drawer,
    Select,
    Divider,
    Input,
    theme,
    Popconfirm,
    Layout,
    Tag,
    Tabs,
    Descriptions,
    Modal,
    Form,
} from "antd";
const { Content } = Layout;
import { useState, useEffect } from "react";
import {
    DeleteRtDataSourceAPI,
    DetailRtDataSourceAPI,
    ListRtDataSourceAPI,
    RegisterRtDataSourceAPI,
    UpdateRtDataSourceAPI,
    ListInstanceAPI,
    ListDatabaseAPI,
    ListDataTablesAPI,
    SaveRtDataSourceAPI,
    GetAllUserAPI,
} from "../request/api";
import {
    RtDataValidity,
    RtOrgan,
    RtSecurityLevel,
    RtStatus,
    RtWriteType,
} from "../assets/dataDictionary/RtDataSource";
import { formatTimestamp } from "../utils/formatTimestamp";
const MyContent = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    // 实时数据源基础信息表格数据行配置
    const columns = [
        {
            title: "实时数据源code",
            dataIndex: "rtCode",
            align: "center",
            render: (_, record) => (
                <Button 
                    onClick={() => {
                        showDrawer();
                        DetailRtDataSourceHandler(record.rtCode);
                    }} 
                    type="link" block>
                    {record.rtCode}
                </Button>
            ),
        },
        {
            title: "名称",
            dataIndex: "rtName",
            align: "center",
            render: (_, record) => {
                return record.rtName;
            },
        },
        {
            title: "状态",
            dataIndex: "rtStatus",
            align: "center",
            render: (_, record) => (
                <Space size='middle'>
                    <Tag
                        color={
                            record.rtStatus === "ONLINE"
                                ? "success"
                                : "processing"
                        }
                    >
                        {RtStatus[record.rtStatus]}
                    </Tag>
                </Space>
            ),
        },
        {
            title: "数据时效",
            dataIndex: "rtDataValidity",
            align: "center",
            render: (_, record) => {
                return RtDataValidity[record.rtDataValidity];
            },
        },
        {
            title: "安全等级",
            dataIndex: "rtSecurityLevel",
            align: "center",
            render: (_, record) => {
                return RtSecurityLevel[record.rtSecurityLevel];
            },
        },
        {
            title: "负责人",
            dataIndex: "rtOwner",
            align: "center",
            render: (_, record) => {
                return record.rtOwner;
            },
        },
        {
            title: "负责组",
            dataIndex: "rtOrgan",
            align: "center",
            render: (_, record) => {
                return RtOrgan[record.rtOrgan];
            },
        },
        {
            align: "center",
            title: "操作",
            render: (_, record) => (
                <Space size='small'>
                    <Button
                        type='link'
                        size='small'
                        block
                        onClick={() => {
                            showDrawer();
                            DetailRtDataSourceHandler(record.rtCode);
                        }}
                    >
                        详情
                    </Button>
                    <Button
                        type='link'
                        size='small'
                        block
                        onClick={() => {
                            showModal();
                            form.setFieldsValue({
                                rtCode: record.rtCode,
                                rtName: record.rtName,
                                rtDataValidity: record.rtDataValidity,
                                rtSecurityLevel: record.rtSecurityLevel,
                                rtOwner: record.rtOwner,
                            });
                        }}
                    >
                        编辑
                    </Button>
                    <Button
                        disabled={record.delStatus === 1}
                        size='small'
                        onClick={() => {
                            RegisterRtDataSourceHandler(record.rtCode);
                            GetListRtDataSourcHandler(current, pageSize);
                        }}
                        type='primary'
                    >
                        上线
                    </Button>

                    <Popconfirm
                        title='是否删除该实时数据源?'
                        cancelText='取消'
                        okText='删除'
                        onConfirm={() => {
                            DeleteRtDataSourceHandler(record.rtCode);
                        }}
                    >
                        <Button
                            disabled={record.rtStatus == "ONLINE"}
                            size='small'
                            type='primary'
                            danger
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];
    // 实时数据源表字段数据行配置
    const tableColumns = [
        {
            title: "字段名",
            dataIndex: "columnName",
            key: "columnName",
        },
        {
            title: "字段类型",
            dataIndex: "columnType",
            key: "columnType",
        },
        {
            title: "字段描述",
            dataIndex: "columnDesc",
            key: "columnDesc",
            render: (_, record) => {
                console.log(record.columnDesc);
                if (record.columnDesc == "") {
                    return "无";
                } else {
                    return record.columnDesc;
                }
            },
        },
    ];

    // 数据表索引字段展示的表格列
    const tableIndex = [
        {
            title: "索引名",
            dataIndex: "indexName",
            key: "indexName",
        },
        {
            title: "索引类型",
            dataIndex: "indexType",
            key: "indexType",
        },
        {
            title: "对应字段",
            dataIndex: "columnName",
            key: "columnName",
        },
    ];

    // 数据控制
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(1);
    const [dataSource, setDataSource] = useState([]);
    const [pageSize, setPageSize] = useState(5);
    const [condition, setCondition] = useState({
        rtOwner: undefined,
        rtOrgan: undefined,
        rtStatus: undefined,
    });
    const [rtSourceInfo, setRtSourceInfo] = useState({
        createdBy: undefined,
        createdAt: undefined,
        rtCode: undefined,
        rtDataValidity: undefined,
        rtName: undefined,
        rtOrgan: undefined,
        rtOwner: undefined,
        rtSecurityLevel: undefined,
        rtStatus: undefined,
        rtWriteType: undefined,
        updatedAt: undefined,
        updatedBy: undefined,
    });

    const [rtTableInfo, setRtTableInfo] = useState({
        instanceName: undefined,
        dbName: undefined,
        tbName: undefined,
        rowSize: undefined,
        avgRowSize: undefined,
        tbDesc: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        columns: [],
        indexes: [],
    });

    const items = [
        {
            key: "1",
            label: "实时数据源信息",
            children: (
                <Descriptions
                    bordered
                    column={1}
                    size='small'
                    style={{ marginBottom: 20 }}
                >
                    <Descriptions.Item label='负责人'>
                        {rtSourceInfo.rtOwner}
                    </Descriptions.Item>
                    <Descriptions.Item label='实时数据源编码'>
                        {rtSourceInfo.rtCode}
                    </Descriptions.Item>
                    <Descriptions.Item label='数据有效性'>
                        {RtDataValidity[rtSourceInfo.rtDataValidity]}
                    </Descriptions.Item>
                    <Descriptions.Item label='实时数据源名称'>
                        {rtSourceInfo.rtName}
                    </Descriptions.Item>
                    <Descriptions.Item label='组织'>
                        {RtOrgan[rtSourceInfo.rtOrgan]}
                    </Descriptions.Item>
                    <Descriptions.Item label='安全级别'>
                        {RtSecurityLevel[rtSourceInfo.rtSecurityLevel]}
                    </Descriptions.Item>
                    <Descriptions.Item label='实时数据源状态'>
                        {RtStatus[rtSourceInfo.rtStatus]}
                    </Descriptions.Item>
                    <Descriptions.Item label='写入类型'>
                        {RtWriteType[rtSourceInfo.rtWriteType]}
                    </Descriptions.Item>
                    <Descriptions.Item label='更新时间'>
                        {formatTimestamp(rtSourceInfo.updatedAt)}
                    </Descriptions.Item>
                    <Descriptions.Item label='更新人'>
                        {rtSourceInfo.updatedBy}
                    </Descriptions.Item>
                    <Descriptions.Item label='创建时间'>
                        {formatTimestamp(rtSourceInfo.createdAt)}
                    </Descriptions.Item>
                    <Descriptions.Item label='创建人'>
                        {rtSourceInfo.createdBy}
                    </Descriptions.Item>
                </Descriptions>
            ),
        },
        {
            key: "2",
            label: "数据表信息",
            children: (
                <Descriptions
                    bordered
                    column={1}
                    size='small'
                    style={{ marginBottom: 20 }}
                >
                    <Descriptions.Item label='实例名'>
                        {rtTableInfo.instanceName}
                    </Descriptions.Item>
                    <Descriptions.Item label='数据库名'>
                        {rtTableInfo.dbName}
                    </Descriptions.Item>
                    <Descriptions.Item label='数据表名'>
                        {rtTableInfo.tbName}
                    </Descriptions.Item>
                    <Descriptions.Item label='数据行数'>
                        {rtTableInfo.rowSize}
                    </Descriptions.Item>
                    <Descriptions.Item label='平均每行长度'>
                        {rtTableInfo.avgRowSize}
                    </Descriptions.Item>
                    <Descriptions.Item label='数据表描述'>
                        {rtTableInfo.tbDesc === "" ? "无" : rtTableInfo.tbDesc}
                    </Descriptions.Item>
                </Descriptions>
            ),
        },
        {
            key: "3",
            label: "字段列表",
            children: (
                <Table
                    columns={tableColumns}
                    dataSource={rtTableInfo.columns}
                    rowKey={(record) => record.columnName}
                    pagination={false}
                    size='small'
                    bordered
                    style={{ marginBottom: 20 }}
                />
            ),
        },
        {
            key: "4",
            label: "索引字段",
            children: (
                <Table
                    columns={tableIndex}
                    dataSource={rtTableInfo.indexes}
                    rowKey={(record) => record.indexName}
                    pagination={false}
                    size='small'
                    bordered
                />
            ),
        },
    ];

    // 对实时数据源进行编辑
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();

    // 打开模态框
    const showModal = () => {
        form.setFieldsValue({
            rtName: rtSourceInfo.rtName,
            rtDataValidity: rtSourceInfo.rtDataValidity,
            rtSecurityLevel: rtSourceInfo.rtSecurityLevel,
            rtWriteType: rtSourceInfo.rtWriteType,
            rtOwner: rtSourceInfo.rtOwner,
        });
        setVisible(true);
        // console.log(rtSourceInfo);
    };

    // 关闭模态框
    const handleCancel = () => {
        setVisible(false);
    };

    // 实时数据源编辑
    const UpdateRtDataSourceHandler = (values) => {
        // console.log(values);
        
        UpdateRtDataSourceAPI(values)
            .then((res) => {
                // console.log(res);
                if (res.code === 200) {
                    message.success("实时数据源信息更新成功");
                    handleCancel();
                    form.setFieldsValue({});
                    GetListRtDataSourcHandler(current, pageSize);
                } else if(res.code === 500) {
                    message.warning(res.msg);
                }
            })
            .catch((e) => {
                message.error(`网络发生故障:${e}`);
            });
    };

    // 实时数据源上线
    const RegisterRtDataSourceHandler = (rtCode) => {
        RegisterRtDataSourceAPI(rtCode)
            .then((res) => {
                // console.log(res);

                if (res.code === 200) {
                    message.success("实时数据源上线成功");
                    GetListRtDataSourcHandler(current, pageSize);
                } else if (res.code === 500) {
                    message.warning(res.msg);
                }
            })
            .catch((e) => {
                message.error(`实时数据源上线操作失败:${e}`);
            });
    };

    const [formAdd] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [instanceNames, setInstanceNames] = useState([]);
    const [dbNames, setDbNames] = useState([]);
    const [tbNames, setTbNames] = useState([]);
    const [selectedInstance, setSelectedInstance] = useState(null);
    const [selectedDb, setSelectedDb] = useState(null);
    const [selectedTb, setSelectedTb] = useState(null);
    const [rtCode, setRtCode] = useState("");
    const [userOptions, setUserOptions] = useState([]);
    const [rtOrgan, setRtOrgan] = useState(0);
    // 获取所有的用户
    const GetAllUser = () => {
        GetAllUserAPI()
            .then((res) => {
                if (res.code === 200) {
                    // console.log(res);
                    setUserOptions(res.data);
                    formAdd.setFieldValue;
                }
            })
            .catch(() => {
                message.error("获取用户信息列表失败");
            });
    };


    // 获取实例名
    const ListInstanceHandler = () => {
        ListInstanceAPI()
            .then((res) => {
                // console.log(res);
                const instanceNameList = [];
                for (let i = 0; i < res.data.length; i++) {
                    instanceNameList.push(res.data[i]["instanceName"]);
                }
                // console.log(instanceNameList);

                setInstanceNames(instanceNameList);
            })
            .catch((e) => {
                message.error("无法加载实例名");
            });
    };

    // 获取实例名列表
    useEffect(() => {
        ListInstanceHandler();
        GetAllUser();
    }, []);

    // 获取数据库名
    const ListDatabaseHandler = (instanceName) => {
        ListDatabaseAPI(instanceName)
            .then((res) => {
                // console.log(res.data);
                const dataBaseNameList = [];
                for (let i = 0; i < res.data.length; i++) {
                    dataBaseNameList.push(res.data[i]["databaseName"]);
                }
                // console.log(dataBaseNameList);

                setDbNames(dataBaseNameList);
            })
            .catch((e) => {
                message.error("无法加载数据库名称");
            });
    };

    // 选择实例名后查询数据库名
    const handleInstanceChange = (value) => {
        setSelectedInstance(value);
        setSelectedDb(null);
        setTbNames([]);
        setRtCode("");
        ListDatabaseHandler(value);
    };

    // 查询数据库中对应的表名
    const ListDataTablesHandler = (selectedInstance, value) => {
        ListDataTablesAPI(selectedInstance, value)
            .then((res) => {
                setTbNames(res.data);
            })
            .catch((e) => {
                message.error("数据库表名获取失败");
            });
    };

    // 选择数据库名后查询表名
    const handleDbChange = (value) => {
        setSelectedDb(value);
        setRtCode(`ds.rt.${value}.`);

        ListDataTablesHandler(selectedInstance, value);
    };

    // 选择数据表名时更新 rtCode
    const handleTbChange = (value) => {
        setSelectedTb(value);
        setRtCode(`ds.rt.${selectedDb}.${value}`);
    };

    // 打开模态框
    const showAddModal = () => {
        setIsModalVisible(true);
    };

    // 关闭模态框
    const handleAddCancel = () => {
        setIsModalVisible(false);
        formAdd.resetFields();
        setRtCode("");
    };

    // 提交实时数据源新增表单
    const handleSubmit = (values) => {
        values.rtCode = rtCode;
        // console.log(values);
        SaveRtDataSourceAPI(values)
            .then((res) => {
                console.log(res);
                if (res.code === 200) {
                    handleAddCancel();
                    GetListRtDataSourcHandler(current, pageSize);
                    message.success("实时数据源新增成功")
                }else if(res.code === 500){
                    message.warning(res.msg)
                }
            })
            .catch((e) => {
                message.error("数据源新增失败");
            });
    };

    // 实时数据源删除操作
    const DeleteRtDataSourceHandler = (rtCode) => {
        DeleteRtDataSourceAPI(rtCode)
            .then((res) => {
                // console.log(res);
                if (res.code === 200) {
                    message.success("实时数据源删除成功");
                    GetListRtDataSourcHandler(1, pageSize)
                } else if (res.code === 500) {
                    message.warning(res.msg);
                }
            })
            .catch((e) => {
                message.error(`实时数据源删除操作失败:${e}`);
            });
    };

    // 条件查询实时数据源基础信息
    const GetConditionList = () => {
        GetListRtDataSourcHandler(current, pageSize);
    };

    // 重置查询条件
    const ResetCondition = () => {
        setCondition({
            rtOwner: undefined,
            rtOrgan: undefined,
            rtStatus: undefined,
        });
    };

    // 分页获取实时数据源基础信息列表
    const GetListRtDataSourcHandler = (page, pageSize) => {
        ListRtDataSourceAPI({ pageNum: page, pageSize: pageSize, ...condition })
            .then((res) => {
                if (res.code === 200) {
                    // console.log(res);
                    setDataSource(res.data.list);
                    setTotal(res.data.total);
                }
            })
            .catch((e) => {
                message.error(`数据获取失败:${e}`);
            });
    };

    //当分页组件发生变化时的回调函数
    const onChange = (page, pageSize) => {
        setPageSize(pageSize);
        setCurrent(page); //设置当前页数
        GetListRtDataSourcHandler(page, pageSize); //重新发起请求
    };

    //利用防抖解决多次渲染
    window.timer = null;
    //当页面首次渲染后调用useEffect来获取数据
    useEffect(() => {
        // 利用防抖来解决useEffect执行两次的问题
        clearTimeout(window.timer);
        window.timer = setTimeout(() => {
            GetListRtDataSourcHandler(current, pageSize);
        }, 0);
    }, []);

    const [open, setOpen] = useState(false);
    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };

    // 查看实时数据源详细信息
    const DetailRtDataSourceHandler = (rtCode) => {
        DetailRtDataSourceAPI(rtCode)
            .then((res) => {
                // console.log(res);

                if (res.code === 200) {
                    // console.log(res);
                    setRtSourceInfo(res.data.sourceInfo);
                    setRtTableInfo(res.data.tableInfo);
                } else if (res.code === 500) {
                }
            })
            .catch((e) => {
                message.error(`查看实时数据源详细信息失败:${e}`);
            });
    };
    return (
        <Content
            style={{
                margin: "24px 16px",
                padding: 24,
                minHeight: 600,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
            }}
        >
            <div>
                <Space
                    wrap
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <Button type='primary' onClick={showAddModal}>
                        新增实时数据源
                    </Button>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 8,
                        }}
                    >
                        
                        <Select
                            placeholder='实时数据源状态'
                            value={condition.rtStatus}
                            style={{ width: 160 }}
                            onChange={(value) => {
                                setCondition((pre) => {
                                    return { ...pre, rtStatus: value };
                                });
                            }}
                            options={[
                                { value: "INIT", label: "初始化" },
                                { value: "ONLINE", label: "已上线" },
                            ]}
                        />
                        <Select
                            style={{ width: 120 }}
                            placeholder='负责人'
                            value={condition.rtOwner}
                            onChange={(e) => {
                                console.log(e);
                                
                                setCondition((pre) => {
                                    return { ...pre, rtOwner: e };
                                });
                            }}
                        >
                            {userOptions.map((user) => {
                                return <Select.Option key={user.id} value={user.username}>
                                    <Space wrap
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        width: "100%",
                                    }}>
                                        <div>{user.username}</div>
                                    </Space>
                                </Select.Option>
                            })}
                        </Select>
                        <Select
                            placeholder='负责组'
                            style={{ width: 120 }}
                            value={condition.rtOrgan}
                            onChange={(value) => {
                                setCondition((pre) => {
                                    return { ...pre, rtOrgan: value };
                                });
                            }}
                            options={[
                                { value: 101, label: "特征小组" },
                                { value: 102, label: "风险小组" },
                                { value: 103, label: "呼叫小组" },
                            ]}
                        >
                            {
                                userOptions.reduce((acc, user) => {
                                    if(!acc.includes(user.organizationCode)){
                                        acc.push(user.organizationCode);
                                    }
                                    return acc;
                                },[]).map(organ => {
                                    <Select.Option key={organ} value={organ}>
                                        {RtOrgan[organ]}
                                    </Select.Option>
                                })
                                
                            }
                        </Select>
                        <Button type='primary' onClick={ResetCondition}>
                            重置查询条件
                        </Button>
                        <Button type='primary' onClick={GetConditionList}>
                            查询
                        </Button>
                    </div>
                </Space>

                <Divider />
                {/* 数据表格 */}
                <Table
                    columns={columns}
                    pagination={false}
                    dataSource={dataSource}
                    rowKey={(record) => record.rtCode} //为列表指定key值
                />
                {/* 分页器 */}
                <Pagination
                    style={{
                        marginTop: "16px",
                        display: "flex",
                        justifyContent: "flex-end",
                    }}
                    total={total}
                    current={current}
                    defaultCurrent={1}
                    defaultPageSize={4}
                    pageSizeOptions={[4, 6, 8]}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total) => `共有 ${total} 数据`}
                    onChange={onChange} //当表单数据改变的时候发起的回调
                />
            </div>

            <Drawer
                title='实时数据源详细信息'
                placement={"bottom"}
                width={500}
                height={420}
                onClose={onClose}
                open={open}
                extra={
                    <Space>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button type='primary' onClick={onClose}>
                            OK
                        </Button>
                    </Space>
                }
            >
                {/* 使用Tabs进行切换 */}
                <Tabs defaultActiveKey='1' type='card' items={items} />
            </Drawer>
            <Modal
                title='编辑实时数据源'
                open={visible}
                footer={null}
                onCancel={handleCancel}
            >
                <Form
                    form={form}
                    layout='vertical'
                    onFinish={UpdateRtDataSourceHandler}
                >
                    <Form.Item label='实时数据源code' name='rtCode' hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label='实时数据源名称'
                        name='rtName'
                        rules={[
                            { required: true, message: "请输入实时数据源名称" },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label='实时数据源数据时效'
                        name='rtDataValidity'
                        rules={[
                            {
                                required: true,
                                message: "请输入实时数据源数据时效",
                            },
                        ]}
                    >
                        <Select>
                            <Select.Option value='realtime'>准实时(秒级)</Select.Option>
                            <Select.Option value='hardrealtime'>
                                强实时(无延迟)
                            </Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label='实时数据源安全等级'
                        name='rtSecurityLevel'
                        rules={[
                            {
                                required: true,
                                message: "请输入实时数据源安全等级",
                            },
                        ]}
                    >
                        <Select>
                            <Select.Option value={1}>L1</Select.Option>
                            <Select.Option value={2}>L2</Select.Option>
                            <Select.Option value={3}>L3</Select.Option>
                            <Select.Option value={4}>L4</Select.Option>
                            <Select.Option value={5}>L5</Select.Option>
                        </Select>
                    </Form.Item>

                    {/* <Form.Item
                        label="实时数据源写入类型"
                        name="rtWriteType"
                        rules={[{ required: true, message: '请输入实时数据源写入类型' }]}
                    >
                        <Select>
                            <Select.Option value="MODIFY">增删改</Select.Option>
                            <Select.Option value="ADD">只新增</Select.Option>
                        </Select>
                    </Form.Item> */}

                    <Form.Item
                        label='实时数据源负责人'
                        name='rtOwner'
                        rules={[
                            {
                                required: true,
                                message: "请输入实时数据源负责人",
                            },
                        ]}
                    >
                        <Select
                            placeholder='实时数据源负责人'
                        >
                            {userOptions.map((user) => (
                                <Select.Option
                                    key={user.id}
                                    value={user.username}
                                >
                                    {user.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label={null}
                        style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                        <Button
                            onClick={handleCancel}
                            type='primary'
                            style={{ marginRight: "10px" }}
                        >
                            取消
                        </Button>
                        <Button type='primary' htmlType='submit'>
                            更新
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            {/* 新增实时数据源 */}
            <Modal
                title='新增实时数据源'
                open={isModalVisible}
                onCancel={handleAddCancel}
                footer={null} // 自定义表单按钮
            >
                <Form form={formAdd} onFinish={handleSubmit} layout='vertical'>
                    <Form.Item
                        label='实例名'
                        name='instanceName'
                        rules={[{ required: true, message: "请选择实例名" }]}
                    >
                        <Select
                            placeholder='请选择实例名'
                            onChange={handleInstanceChange}
                        >
                            {instanceNames.map((name) => (
                                <Select.Option key={name} value={name}>
                                    {name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label='数据库名'
                        name='dbName'
                        rules={[{ required: true, message: "请选择数据库名" }]}
                    >
                        <Select
                            placeholder='请选择实例名'
                            value={selectedDb}
                            onChange={handleDbChange}
                            disabled={!selectedInstance}
                        >
                            {dbNames.map((name) => (
                                <Select.Option key={name} value={name}>
                                    {name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label='数据表名'
                        name='tbName'
                        rules={[{ required: true, message: "请选择数据表名" }]}
                    >
                        <Select
                            placeholder='请选择数据数据库名'
                            value={selectedTb}
                            onChange={handleTbChange}
                            disabled={!selectedDb}
                        >
                            {tbNames.map((name) => (
                                <Select.Option key={name} value={name}>
                                    {name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* 其他字段 */}
                    <Form.Item
                        label='实时数据源名称'
                        name='rtName'
                        rules={[
                            { required: true, message: "请输入实时数据源名称" },
                        ]}
                    >
                        <Input placeholder='实时数据源名称' />
                    </Form.Item>

                    <Form.Item
                        label='实时数据源负责人'
                        name='rtOwner'
                        rules={[
                            {
                                required: true,
                                message: "请选择实时数据源负责人",
                            },
                        ]}
                    >
                        <Select
                            placeholder='实时数据源负责人'
                            onChange={(value) => {
                                // 根据选中的用户 ID 找到对应的责任组
                                console.log(value);
                                const selectedUser = userOptions.find(
                                    (user) => user.username === value,
                                );
                                console.log(selectedUser);
                                if (selectedUser) {
                                    setRtOrgan(selectedUser.organizationCode);
                                    // 同步更新表单中的负责组字段值
                                    formAdd.setFieldsValue({
                                        rtOrgan: selectedUser.organizationCode,
                                    });
                                }
                            }}
                        >
                            {userOptions.map((user) => (
                                <Select.Option
                                    key={user.id}
                                    value={user.username}
                                >
                                    {user.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label='实时数据源负责组'
                        name='rtOrgan'
                        rules={[
                            {
                                required: true,
                                message: "请选择负责人",
                            },
                        ]}
                    >
                        <Select disabled>
                            {rtOrgan && (
                                <Select.Option value={rtOrgan}>
                                    {RtOrgan[rtOrgan]}
                                </Select.Option>
                            )}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label='实时数据源安全等级'
                        name='rtSecurityLevel'
                        rules={[
                            {
                                required: true,
                                message: "请选择实时数据源安全等级",
                            },
                        ]}
                    >
                        <Select placeholder='实时数据源安全等级'>
                            <Select.Option value='1'>L1</Select.Option>
                            <Select.Option value='2'>L2</Select.Option>
                            <Select.Option value='3'>L3</Select.Option>
                            <Select.Option value='4'>L4</Select.Option>
                            <Select.Option value='5'>L5</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label='实时数据源写入类型'
                        name='rtWriteType'
                        rules={[
                            {
                                required: true,
                                message: "请选择实时数据源写入类型",
                            },
                        ]}
                    >
                        <Select placeholder='实时数据源写入类型'>
                            <Select.Option value='MODIFY'>增删改</Select.Option>
                            <Select.Option value='ADD'>只新增</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label='实时数据源数据时效'
                        name='rtDataValidity'
                        rules={[
                            {
                                required: true,
                                message: "请选择实时数据源数据时效",
                            },
                        ]}
                    >
                        <Select placeholder='实时数据源数据时效'>
                            <Select.Option value='realtime'>
                                准实时(秒级)
                            </Select.Option>
                            <Select.Option value='hardrealtime'>
                                强实时(无延迟)
                            </Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type='primary' htmlType='submit'>
                            保存
                        </Button>
                        <Button
                            style={{ marginLeft: "10px" }}
                            onClick={handleAddCancel}
                        >
                            取消
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Content>
    );
};
export default MyContent;
