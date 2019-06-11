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

    generalSettings: {
      sms: {
        getsmscode: {
          email: "jerkinly@gmail.com",
          token: "e5ff73708747af0bb5bcb7984266d9e1"
        }
      }
    },

    // This is data for 'Account Log' page, and is going to be created.
    pendingList: [],

    // This is data for 'Verify Log' page, and is going to be verified.
    createdList: [
      {
        number: "###########",
        account_email: "james_stewart0123+nwg3it@gmail.com",
        password: "@tSt!~3ad#a",
        status: {
          code: 0,
          message: "Idle"
        }
      }
    ]
  },
  getters: {
    accountSettings: state => {
      return state.accountSettings;
    },
    generalSettings: state => {
      return state.generalSettings;
    },
    pendingList: state => {
      return state.pendingList;
    },
    createdList: state => {
      return state.createdList;
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
    },
    SET_CREATED_LIST: (state, data) => {
      console.log("committing SET_CREATED_LIST");

      state.pendingList = [...data];
      state.createdList = state.pendingList.filter(
        item => item.status.code === 6 // Blue Status, Success
      );

      console.log(state.createdList);
    }
  }
});
