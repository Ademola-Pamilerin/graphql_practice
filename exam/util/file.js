const fs = require("fs");

const deleteFile = (path) => {
  fs.unlink(path, (err) => {
    if (err) {
      if (err === "ENODENT") {
        return 0;
      } else 
      return 0;
    }
  });
};

module.exports = deleteFile;
