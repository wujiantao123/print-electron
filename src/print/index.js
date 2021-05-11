import axios from "axios";
import FormData from "form-data";
axios.defaults.baseURL = "https://user.api.it120.cc";
axios.defaults.headers["X-Token"] = "dd299bd6-97f8-4bb4-84c2-aa5e3b2ec8c1";

axios.interceptors.response.use(
  function(response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
  },
  function(error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);
/**
 * 查询待发货订单
 */
const getOrders = async () => {
  // 这里查待发货的订单
  const params = new FormData();
  params.append("page", 1);
  params.append("pageSize", 10);
  params.append("statusTab", 1);
  params.append("status", 1);
  const response = await axios.post("/user/apiExtOrder/list", params, {
    headers: params.getHeaders(),
  });
  console.log(response);
  if (response.code === 0) {
    console.log("查到的订单数：", response.data.result.length);
    response.data.result.forEach((item) => setOrderStatus(item));
    // 定时获取最新订单
    timeoutOrders();
  } else {
    timeoutOrders();
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
export default getOrders;
