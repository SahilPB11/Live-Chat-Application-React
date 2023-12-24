import connectDB from "./ConnectDb/connectDb.js";
import { app } from "./index.js";
const port = process.env.PORT;

// here first i am connecting with database and then i am starting the server
connectDB().then(
  app.listen(port, () => console.log(`Server is Working on ${port}`))
);
