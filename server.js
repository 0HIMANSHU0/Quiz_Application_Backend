const express = require("express");
const dbConfig = require("./config/dbConfig");
require("dotenv").config();
const cors = require("cors");

dbConfig();
const usersRoute = require("./routes/usersRoutes");
const examsRoute = require("./routes/examsRoutes");
const reportsRoute = require("./routes/reportsRoutes");
const courseRoute = require("./routes/courseRoutes");
const universityRoute = require("./routes/universityRoutes");


const app = express();
app.use(express.json());
app.use(cors());

// Avaliable Routes
app.use("/api/user", usersRoute);
app.use("/api/exam", examsRoute);
app.use("/api/report", reportsRoute);
app.use("/api/course", courseRoute);
app.use("/api/university", universityRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`The server is listening on ${PORT}`);
});
