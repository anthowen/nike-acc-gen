<template>
  <div class="table-wrapper px-2" ref="logDisplay" :style="{maxHeight: tHeight+'%'}">
    <div class="table w-full" :style="{maxHeight: tHeight+'%'}">
      <div class="table-row">
        <div
          v-for="heading in tableConfig"
          :key="heading.prop"
          class="table-cell p-3 text-lg font-bold bg-nike-darkest border-nike-border"
        >{{heading.name}}</div>
      </div>
      <!-- bg-nike-darkest border-solid border-1 border-nike-border rounded-lg -->
      <div v-for="(row, index) in tableData" :key="index" class="table-row text-sm">
        <div class="table-cell bg-nike-darkest border-nike-border p-3 text-grey">{{index + 1}}</div>
        <div
          v-for="(value, name) in row"
          :key="name"
          class="table-cell bg-nike-darkest border-nike-border p-3 text-grey"
          v-bind:class="{hidden: name.startsWith('_')}"
        >
          <div v-if="!name.startsWith('_') && name !=='status'">{{ value }}</div>
          <div v-if="name ==='status'">
            <span
              class="float-left"
              :class="{
                'text-nike-orange': value.code === 0,
                'text-nike-blue': value.code === 2,
                'text-nike-cyan': value.code === 1,
                'text-nike-purple': value.code === 4,
                'text-nike-green': value.code === 6,
                'text-nike-pink': value.code === 5,
                'text-nike-red': value.code === 3}"
            >{{ value.message }}</span>
            <span class="float-right">
              <span class="ml-2 rounded-full h-2 w-2 inline-block justify-center bg-nike-green"></span>
              <span class="ml-2 rounded-full h-2 w-2 inline-block justify-center bg-nike-red"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tConfig: Array,
    tData: Array,
    tHeight: {
      type: Number,
      default: 90
    },
    tName: {
      type: String,
      default: "logTable"
    }
  },
  mounted() {
    this.$on("scrollToBottom", function(tname) {
      // ...
      if (this.tName === tname) this.scrollToBottom();
    });
  },
  data: function() {
    return {
      tableConfig: this.tConfig,
      tableData: this.tData
    };
  },
  methods: {
    handleSelectionChange(rows) {
      console.log(rows);
    },
    edit(index, row) {
      console.log(index, row);
    },
    del(index, row) {
      console.log(index, row);
    },
    scrollToBottom() {
      const logDisplay = this.$refs.logDisplay;
      logDisplay.scrollTop = logDisplay.scrollHeight;
    }
  }
};
</script>
<style lang="scss">
.table-wrapper {
  overflow-y: auto;
  overflow-x: hidden;
  .table {
    border-collapse: separate;
    border-spacing: 0 0.8em;
    overflow-y: auto;
    overflow-x: hidden;

    .table-cell {
      border-width: 1px 0;

      &:first-child {
        border-radius: 0.7rem 0 0 0.7rem;
        border-left-width: 1px;
      }

      &:not(.hidden):last-child {
        border-radius: 0 0.7rem 0.7rem 0;
        border-right-width: 1px;
      }
    }
  }
}
</style>