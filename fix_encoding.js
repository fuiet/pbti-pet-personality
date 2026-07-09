const fs = require("fs");
const path = require("path");
const enc = "utf8";

const memPath = "app" + path.sep + "memory" + path.sep + "[id]" + path.sep + "page.tsx";
const repPath = "app" + path.sep + "report" + path.sep + "[id]" + path.sep + "page.tsx";

// Just re-read and re-write - git might still have the content in the object store
console.log("Memory:", fs.existsSync(memPath) ? fs.statSync(memPath).size + " bytes" : "NOT FOUND");
console.log("Report:", fs.existsSync(repPath) ? fs.statSync(repPath).size + " bytes" : "NOT FOUND");
