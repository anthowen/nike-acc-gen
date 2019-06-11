<template>
  <div class="bg-nike-dark flex-1 text-white p-24 px-16 mt-4 route-view-container">
    <h3 class="text-white">Verification</h3>
    <p class="text-grey header-description">This tab is for verifying your Nike accounts</p>

    <log-table class="mt-5" :tConfig="tableConfig" :tData="tableData" :tHeight="94"></log-table>
    <div class="button-group text-center px-16">
      <button
        class="float-left px-10 py-2 order-solid border-2 border-nike-yellow text-white text-lg rounded-lg"
        @click="exportLog"
      >Export</button>
      <button
        class="mx-5 px-10 py-2 order-solid border-2 border-nike-green text-white text-lg rounded-lg"
        @click="startCreatingAccount"
      >Start</button>
      <button
        class="mx-5 px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg"
        @click="stopCreatingAccount"
      >Stop</button>
      <button
        class="mx-5 px-10 py-2 order-solid border-2 border-nike-yellow text-white text-lg rounded-lg"
        @click="retryFailedAccount"
      >Retry</button>
      <button
        class="float-right px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg"
        @click="clearLog"
      >Clear</button>
    </div>
  </div>
</template>


<script>
import LogTable from "../components/LogTable.vue";

export default {
  mounted() {
    // this.$socket.on("statusEmit", data => {
    //   console.log(
    //     `this method was fired by the socket server. eg: io.emit("statusEmit", ${data})`
    //   );

    //   this.tableData[data.index].status = {
    //     code: data.code,
    //     message: data.message
    //   };
    // });

    for (let i = 0; i < 13; i++) {
      this.tableData.push({
        number: "1234567890",
        account_email: this.getRandomString(10) + "@gmail.com",
        password: "#new@e9sAQ123",
        status: {
          code: Math.floor(Math.random() * 7),
          message: this.getRandomString(10)
        }
      });
    }
  },
  components: {
    LogTable
  },
  data: function() {
    return {
      tableConfig: [
        { prop: "_index", name: "ID" },
        { prop: "number", name: "Number" },
        { prop: "acc_email", name: "Account Email" },
        { prop: "password", name: "Account Password" },
        { prop: "status", name: "Status" }
      ],
      tableData: []
    };
  },
  methods: {
    exportLog() {},
    clearLog() {},
    getRandomString(len) {
      return [...Array(len)]
        .map(() => (~~(Math.random() * 36)).toString(36))
        .join("");
    },

    startCreatingAccount() {
      // let setting = this.$store.getters.accountSettings;
    },
    stopCreatingAccount() {},
    retryFailedAccount() {}
  }
};
</script>
<style lang="scss">
.button-group {
  .middle {
    // display: block;
    // margin: 0em auto;
    // width: 800px;
    display: flex;
    justify-content: center;
    // button {
    //   width: 20%;
    // }
  }
}
</style>
