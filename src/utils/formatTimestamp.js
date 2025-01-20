export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp); // 将时间戳转换为 Date 对象
    const year = date.getFullYear(); // 获取年份
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 获取月份并补充为两位数
    const day = String(date.getDate()).padStart(2, '0'); // 获取日期并补充为两位数
    const hours = String(date.getHours()).padStart(2, '0'); // 获取小时并补充为两位数
    const minutes = String(date.getMinutes()).padStart(2, '0'); // 获取分钟并补充为两位数
    const seconds = String(date.getSeconds()).padStart(2, '0'); // 获取秒并补充为两位数

    // 返回格式化后的日期字符串
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}