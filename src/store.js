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
    }
  },
  getters: {
    accountSettings: state => {
      return state.accountSettings;
    }
  },
  mutations: {
    SET_ACCOUNT_SETTINGS: (state, payload) => {
      state.accountSettings = payload;
    },
    ADD_ACCOUNT_SETTINGS: (state, payload) => {
      state.accountSettings.push(payload);
    }
  }
});
