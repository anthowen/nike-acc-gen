<template>
  <div class="bg-nike-dark text-white p-24 px-16 w-full mt-4 route-view-container">
    <h3 class="text-white">Account Logs</h3>
    <p
      class="text-grey header-description"
    >This tab shows the status of the making of your Nike accounts</p>

    <log-table class="mt-5" :tConfig="tableConfig" :tData="tableData" :tHeight="90"></log-table>
    <div class="button-group text-center px-16">
      <button
        class="float-left px-10 py-2 order-solid border-2 border-nike-yellow text-white text-lg rounded-lg"
        @click="exportLog"
      >Export</button>
      <button
        class="mx-2 px-10 py-2 order-solid border-2 border-nike-green text-white text-lg rounded-lg"
        @click="startCreatingAccount"
      >Start</button>
      <button
        class="mx-2 px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg"
        @click="stopCreatingAccount"
      >Stop</button>

      <button
        class="float-right px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg"
        @click="clearLog"
      >Clear</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { TaskQueue } from "cwait";
import LogTable from "../components/LogTable.vue";

export default {
  mounted() {
    this.$socket.on("statusEmit", data => {
      console.log(
        `this method was fired by the socket server. eg: io.emit("statusEmit", ${data})`
      );

      this.tableData[data.index].status = {
        code: data.code,
        message: data.message
      };
    });
  },
  components: {
    LogTable
  },
  data: function() {
    return {
      tableConfig: [
        { prop: "_index", name: "ID" },
        { prop: "first_name", name: "First Name" },
        { prop: "last_name", name: "Last Name" },
        { prop: "country", name: "Country" },
        { prop: "number", name: "Number" },
        { prop: "e_domain", name: "Email Domain" },
        { prop: "password", name: "Password" },
        { prop: "e_template", name: "Email Template " },
        { prop: "status", name: "Status" }
      ],
      tableData: []
    };
  },
  methods: {
    exportLog() {},
    clearLog() {},
    generateDotEmailNames(name) {
      var length = name.length,
        i,
        j;
      var combinations = Math.pow(2, length - 1);
      var emailList = [];
      for (i = 0; i < combinations; i++) {
        var bin = this.decBin(i, length - 1);
        var full = "";
        for (j = 0; j < length - 1; j++) {
          full += name[j];
          if (bin[j] == 1) {
            full += ".";
          }
        }
        full += name[j];
        emailList.push(full);
      }

      return emailList;
    },
    decBin(dec, length) {
      var out = "";
      while (length--) out += (dec >> length) & 1;
      return out;
    },
    getRandomString(len) {
      return [...Array(len)]
        .map(() => (~~(Math.random() * 36)).toString(36))
        .join("");
    },
    addAccountList(setting) {
      let dotEmails,
        dummy = {
          first_name: setting.firstName,
          last_name: setting.lastName,
          country: setting.country.name,
          number: "############",
          e_domain: setting.emailDomain,
          password: setting.password,
          e_template: setting.emailTemplate,
          gender: setting.gender.name,
          status: {
            code: 0,
            message: "Pending ..."
          },
          email: ""
        };

      // Pre setting
      if (setting.generatorType.type === 3) {
        dummy.e_template = "";
      } else {
        var atPos = dummy.e_template.indexOf("@");
        if (atPos > 0) dummy.e_template = dummy.e_template.substring(0, atPos);
      }

      if (setting.generatorType.type === 1) {
        dotEmails = this.generateDotEmailNames(
          dummy.e_template.replace(/\./g, "")
        );
      }

      for (var i = 0; i < setting.accountQuantity; i++) {
        let item = Object.assign({}, dummy);

        if (setting.generatorType.type === 1) {
          item.email = dotEmails[Math.floor(Math.random() * dotEmails.length)];
        } else if (setting.generatorType.type === 2) {
          item.email = item.e_template + "+" + this.getRandomString(6);
        } else if (setting.generatorType.type === 3) {
          item.email = this.getRandomString(10);
        }

        item.e_template = item.email;
        item.email += item.e_domain;

        console.log(item.email);
        this.tableData.push(item);
      }
    },
    checkUniqueness(userInfo) {
      console.log("checking uniqueness ");
      return axios
        .post("http://localhost:5000/create", {
          proxy: null,
          user: userInfo,
          sms: null
        })
        .then(response => {
          console.log("2. server response:" + response.data.unique);
          // this.valid = response.data.unique;
          console.log(response.data);
        });
    },
    async startCreatingAccount() {
      let setting = this.$store.getters.accountSettings;

      if (setting === null) {
        alert("Setting has not finished yet");
        return;
      }

      this.addAccountList(setting);

      this.$socket.emit("join", {
        message: "Create account started"
      });

      // a concurrency parameter of 1 makes all api requests secuential
      const MAX_SIMULTANEOUS_DOWNLOADS = 2;
      // init your manager.
      const queue = new TaskQueue(Promise, MAX_SIMULTANEOUS_DOWNLOADS);

      const results = await Promise.all(
        this.tableData.map((item, index) =>
          this.checkUniqueness({
            tableIndex: index,
            email: item.email,
            password: item.password,
            country: item.country,
            firstName: item.first_name,
            lastName: item.last_name
          })
        )
      ).then(responses => {
        // ...
        console.log("reponses.leng = " + responses.length);
      });

      console.log(queue);
      console.log(results);

      // var smsEmail = "ENTER GETSMSCODE.COM EMAIL ADDRESS";
      // var token = "ENTER GETSMSCODE API TOKEN";
      // var proxyUrl = ""; //if proxy exists enter it in format IP:PORT, if not leave blank
      // var proxyUser = ""; //If proxy name/pass exists insert it here if not leave both variables blank
      // var proxyPass = "";
    },
    stopCreatingAccount() {}
  }
};
</script>
<style lang="scss">
</style>
