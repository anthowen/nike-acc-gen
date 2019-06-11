"use strict";

module.exports = {
  generate(name) {
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
  }
};
