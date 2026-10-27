import "dotenv/config";
import {parseExpenseText, parseReceipt} from "./services/aiParserService.js";
import { rupeeToPaise } from "./utils/rupeeConversion.js";

// try {
//   const result = await parseExpenseText("asdf");
//   console.log(result);
// } catch (err) {
//   console.log(err.statusCode, err.message);
// }

// import fs from "fs";

// const file = process.argv[2];
// const ext = file.split(".").pop().toLowerCase();
// const mimetype = ext === "png" ? "image/png" : "image/jpeg";

// try {
//   const result = await parseReceipt({ buffer: fs.readFileSync(file), mimetype });
//   console.log("RESULT:", result);
// } catch (err) {
//   console.log("ERROR:", err.statusCode ?? err.status, err.message);
// }

// import "dotenv/config";
// import fs from "fs";
// import { uploadReceipt } from "./config/cloudinary.js";

// try {
//   console.log("URL:", await uploadReceipt(fs.readFileSync(process.argv[2])));
// } catch (err) {
//   console.log("ERROR:", err.statusCode ?? err.status, err.message);
// }

console.log(rupeeToPaise(1.15));
console.log(rupeeToPaise(0.07));
console.log(rupeeToPaise(450.5));