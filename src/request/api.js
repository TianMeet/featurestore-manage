import request from "./index"

// 实时数据源分页查询
export const ListRtDataSourceAPI = (params) => request.post("/rtDataSource/listRtDataSource", params);

// 实时数据源新增
export const SaveRtDataSourceAPI = (params) => request.post("/rtDataSource/saveRtDataSource", params)

// 查看实时数据源详情
export const DetailRtDataSourceAPI = (rtCode) => request.post("/rtDataSource/detailRtDataSource", new URLSearchParams({ rtCode }))

// 实时数据源上线
export const RegisterRtDataSourceAPI = (rtCode) => request.post("/rtDataSource/registerRtDataSource", new URLSearchParams({ rtCode }))

// 删除实时数据源
export const DeleteRtDataSourceAPI = (rtCode) => request.post("/rtDataSource/deleteRtDataSource", new URLSearchParams({ rtCode }))

// 编辑实时数据源
export const UpdateRtDataSourceAPI = (params) => request.post("/rtDataSource/updateRtDataSource", params)

// 获取数据库实例
export const ListInstanceAPI = () => request.post("/DbGateway/listInstance");

// 获取数据库信息列表
export const ListDatabaseAPI = (instanceName) => request.post("/DbGateway/listDatabase", new URLSearchParams({instanceName}));

// 获取数据库表名称列表
export const ListDataTablesAPI = (instanceName, databaseName) => request.post("/DbGateway/listDataTables", new URLSearchParams({instanceName, databaseName}));

//获取所有的用户信息
export const GetAllUserAPI = () => request.get("/user/getAllUser");