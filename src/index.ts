// index.ts
import "reflect-metadata"
import express from "express";
import middleware  from "#middleware/authmiddleware.js";
import userRoutes from "./routes/user.routes";
import authRouter from "#routes/auth.routes.js";
import { myDataSource } from "#utils/app-data-source.js";


const app = express();
const port = process.env.port ?? "9001";

try{
    await myDataSource.initialize();
    console.log("Database connected");
}
catch(error){
  console.error("Database connection failed:", error);
}

app.use(express.json());

//routes
app.use("/users", userRoutes);
app.use("/api/auth", authRouter);


app.get("/", middleware);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
