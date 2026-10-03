import "dotenv/config";
import {parseExpenseText} from "./services/aiParserService.js";

try {
  const result = await parseExpenseText("asdf");
  console.log(result);
} catch (err) {
  console.log(err.statusCode, err.message);
}