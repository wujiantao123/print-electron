<template>
  <div>
    <el-form
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      v-if="status === 1 && !token"
    >
      <el-form-item prop="userName" label="账号">
        <el-input
          v-model="ruleForm.userName"
          placeholder="请输入登录账号"
        ></el-input>
      </el-form-item>
      <el-form-item prop="pwd" label="密码">
        <el-input
          v-model="ruleForm.pwd"
          placeholder="请输入登录密码"
        ></el-input>
      </el-form-item>
      <el-form-item prop="imgcode" label="验证码">
        <el-input v-model="ruleForm.imgcode" placeholder="请输入验证码">
          <template #append>
            <img
              @click="setK()"
              style="width: 60px"
              :src="'https://user.api.it120.cc/code?k=' + k"
              alt=""
            />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item style="text-align: center">
        <el-button
          :loading="loading"
          type="primary"
          @click="submitForm('ruleForm')"
        >
          登录</el-button
        >
      </el-form-item>
    </el-form>
    <el-row v-else>
      <el-col :sm="12" :lg="6">
        <el-result
          v-if="!token"
          icon="error"
          title="打印机离线"
          subTitle="请连接打印机"
        >
          <template #extra>
            <el-button type="primary" size="medium" @click="ipc()"
              >我已连接</el-button
            >
          </template>
        </el-result>
        <el-result v-else icon="success" title="打印机在线"> </el-result>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from "./chinese/service/axios";
import { remote, ipcRenderer } from "electron";
export default {
  name: "App",
  data() {
    return {
      token: remote.getGlobal("X-Token"),
      status: 0,
      loading: false,
      k: Math.random(),
      ruleForm: {
        userName: "",
        pwd: "",
        imgcode: "",
      },
      rules: {
        userName: [
          { required: true, message: "请输入登录账号", trigger: "blur" },
        ],
        pwd: [{ required: true, message: "请输入登录密码", trigger: "blur" }],
        imgcode: [{ required: true, message: "请输入验证码", trigger: "blur" }],
      },
    };
  },
  created() {
    console.log(this.token);
    this.ipc();
    ipcRenderer.on("on_result", (event, data) => {
      this.status = data;
    });
    ipcRenderer.on("on_get_global", (event, value) => {
      this.token = value;
    });
  },
  methods: {
    ipc() {
      ipcRenderer.send("get_xp");
    },
    submitForm() {
      console.log(remote.getGlobal("X-Token"));
      this.$refs["ruleForm"].validate(async (valid) => {
        if (valid) {
          const params = new FormData();
          params.append("userName", this.ruleForm.userName);
          params.append("pwd", this.ruleForm.pwd);
          params.append("imgcode", this.ruleForm.imgcode);
          params.append("k", this.k);
          this.loading = true;
          const response = await axios.post("/login/userName/v2", params, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          });
          this.loading = false;
          if (response.code === 0) {
            ipcRenderer.send("set_global", {
              key: "X-Token",
              value: response.data.token,
            });
            console.log(response);
          } else {
            alert("密码错误");
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    setK() {
      this.k = Math.random();
    },
  },
};
</script>