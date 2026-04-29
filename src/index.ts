// app.ts
import express from "express";
import middleware  from "#middleware/authmiddleware.js";
import userRoutes from "./routes/user.routes";
import authRouter from "#routes/auth.routes.js";
import { myDataSource } from "#utils/app-data-source.js";

const app = express();
const port = process.env.port ?? "9001";

app.use(express.json());

//routes
app.use("/users", userRoutes);
app.use("/api/auth", authRouter);


app.get("/", middleware);

const serverStart = async()=>{
  try{
    await myDataSource.initialize();
    console.log("Database connected");

    app.listen(port, ()=>{
      console.log(`App listening on port ${port}`);
    })
  }catch(error){
    console.error("Database connection failed:", error);
  }
}
serverStart();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});