import axios from "axios";
axios.defaults.baseURL = "https://user.api.it120.cc";
axios.defaults.headers["X-Token"] = "d50c6556-209f-48fa-8bfc-7aea63ca8ff8";
// ipcRenderer.on("on_get_global", (event, data) => {
//   console.log(data);
// });
axios.interceptors.request.use(
  (res) => {
    const config = res;
    // if (config.url.startsWith('/wxz')) {
    //   config.baseURL = config.baseURL.replace('/api', '');
    // }
    return config;
  },
  (err) => Promise.reject(err)
);

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
export default axios;
