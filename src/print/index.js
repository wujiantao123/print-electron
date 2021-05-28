import axios from "../chinese/service/axios";
import FormData from "form-data";
import print from "../chinese/chinese/printer-example.js";
import xp from "../chinese/chinese/xpsdk-demo.js";
/**
 * 查询待发货订单
 */
const getOrders = async (_token) => {
  if (_token) axios.defaults.headers["X-Token"] = _token;
  // 这里查待发货的订单
  const params = new FormData();
  params.append("page", 1);
  params.append("pageSize", 10);
  params.append("statusTab", 1);
  params.append("status", 1);
  try {
    const response = await axios.post("/user/apiExtOrder/list", params, {
      headers: params.getHeaders(),
    });
    console.log(response)
    if (response.code === 0) {
      console.log("查到的订单数：", response.data.result.length);
      response.data.result.forEach(async (item) => {
        const logisticsMap = response.data.logisticsMap[item.id];
        // 获取订单详情
        const response2 = await axios.get(
          "/user/apiExtOrder/detail?id=" + item.id
        );
        // 调用打印机
        const result = await print.printFontAlign({
          title: item.shopName,
          delivery: item.isNeedLogistics ? "商家配送" : "到店自取",
          remark: item.remark,
          dateAdd: item.dateAdd,
          orderNumber: item.orderNumber,
          address: logisticsMap
            ? `${logisticsMap.linkMan},${
                logisticsMap.mobile
              },${logisticsMap.provinceStr +
                logisticsMap.cityStr +
                logisticsMap.areaStr +
                logisticsMap.address}`
            : '联系人：'+response2.data.extJson['联系人']+',联系电话：'+response2.data.extJson['联系电话'],
          goodsList: response2.data.goodsList,
          sumAamountReal: response.data.aggregate.sum_amount_real,
          amountLogistics: item.amountLogistics,
        });
        console.log("result", result);
        if (result.code === 0) {
          setTimeout(async ()=>{
            const result2 = await xp.xpYunQueryOrderStateTest(result.data);
            if(result2){
              setOrderStatus(item);
            }
            console.log('打印结果',result2)
          },3000)
        }
      });
      // 定时获取最新订单
      timeoutOrders();
    } else {
      timeoutOrders();
    }
  } catch (error) {
    timeoutOrders();
    console.log(error)
  }
  
};

/**
 * 修改订单状态
 * @param isNeedLogistics true 需要发货 false不需要
 */
const setOrderStatus = async ({ id, isNeedLogistics }) => {
  console.log(id, ":", isNeedLogistics ? "需要发货" : "不需要");
  const params = new FormData();
  params.append("expressCompanyId", -1);
  params.append("id", id);
  const response = await axios.post(
    isNeedLogistics ? "/user/apiExtOrder/fahuo" : "/user/apiExtOrder/success",
    params,
    {
      headers: params.getHeaders(),
    }
  );
  console.log(response);
};

/**
 * 定时获取订单
 */
const timeoutOrders = (time = 10000) => {
  setTimeout(() => {
    getOrders();
  }, time);
};

/**
 * 检查打印机状态
 */
const checkXp = async (win) => {
  const response = await xp.xpYunQueryPrinterStatusTest();
  console.log(response);
  if (win) win.webContents.send("on_result", response.data);
};
export { checkXp, getOrders };
