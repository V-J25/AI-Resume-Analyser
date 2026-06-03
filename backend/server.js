import dotenv from "dotenv";
dotenv.config({ path: new URL("./.env", import.meta.url) });
import { connectDB } from "./src/config/database.js";

import { app } from "./src/app.js";

connectDB();

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
