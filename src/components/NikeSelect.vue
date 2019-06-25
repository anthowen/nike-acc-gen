<template>
  <div class="V-select mx-3 mt-3">
    <input
      class="lg px-2 py-2 border border-nike-border rounded-lg h-10 w-full py-2 px-3 text-grey"
      :value="!selectedOption ? placeholder : selectedOption.name"
      readonly
      @click="open=true"
    >
    <ul v-show="open" class="rounded border border-nike-border">
      <li
        v-for="(option,i) in options"
        @click="updateOption(option,i)"
        :class="{selected:i==selectedItem}"
        :key="i"
      >{{ option.name }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: [Array, Object]
    },
    placeholder: String,
    selected: {}
  },
  data() {
    return {
      selectedOption: {},
      open: false,
      selectedItem: null
    };
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    selected: function(newVal, oldVal) {
      // watch it
      console.log("Selected Props changed externally");
      this.selectedOption = newVal;
    }
  },
  created() {
    this.selectedOption = this.selected;
    document.body.addEventListener("click", this.close);
  },
  beforeDestroy() {
    document.body.removeEventListener("click", this.close);
  },
  methods: {
    updateOption(option, i) {
      this.selectedItem = i;
      this.selectedOption = option;
      this.open = false;
      this.$emit("updateOption", option);
    },
    close(e) {
      //console.log(this.$el);
      if (!this.$el.contains(e.target)) this.open = false;
    }
  }
};
</script>

<style lang="scss">
$ike-dark: #0b1116;
$nike-border: #1b1b1b;
$nike-darkest: #080c0f;
$nike-grey: #747474;

.V-select {
  user-select: none;
  display: inline-block;
  position: relative;

  input {
    background: $nike-darkest url(../assets/arrow.png) 100% no-repeat;
    cursor: pointer;
  }

  ul {
    z-index: 3;
    list-style: none;
    position: absolute;
    background: $nike-darkest;
    width: 100%;
    box-shadow: 0 0.2em 1.4em 0 rgba(0, 0, 0, 0.2);
    li {
      cursor: pointer;
      color: $nike-grey;
      border-top: 1px solid $nike-border;

      &:first-child {
        border-top: 0px solid black;
      }

      padding: 0 1em;
      line-height: 2.4;

      &.selected {
        // color: rgb(98, 94, 104);
      }
      &:hover {
        background: $nike-darkest;
        opacity: 0.7;
      }
    }
  }
}
</style>