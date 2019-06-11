import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    accountSettings: {
      firstName: "Asley",
      lastName: "Kingstar",
      emailDomain: "@gmail.com",
      emailTemplate: "cto.sporting2019@gmail.com",
      accountQuantity: 1,
      birthdate: "12/03/1986",
      password: "@tSt!~3ad#a",
      number: "432658932",
      country: null,
      gender: null,
      generatorType: null
    },

    // This is data for 'Account Log' page, and is going to be created.
    pendingList: []
  },
  getters: {
    accountSettings: state => {
      return state.accountSettings;
    },
    pendingList: state => {
      return state.pendingList;
    }
  },
  mutations: {
    SET_ACCOUNT_SETTINGS: (state, payload) => {
      state.accountSettings = payload;
    },
    ADD_ACCOUNT_SETTINGS: (state, payload) => {
      state.accountSettings.push(payload);
    },
    ADD_TO_PENDING_LIST: (state, data) => {
      console.log("committing ADD_TO_PENDING_LIST");
      data.every(item => state.pendingList.push(item));
    },
    EMPTY_PENDING_LIST: state => {
      console.log("committing EMPTY_PENDING_LIST");
      state.pendingList.length = 0;
    }
  }
});
