import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import morgan from 'morgan'

const dataM = JSON.parse(readFileSync('./generated.json').toString());
const app = express();

app.use(morgan('dev'))
app.use(cors());

app.get("/", (req, res) => {
  res.json(dataM);
});

app.post('/', (req,res)=>{
  res.json(dataM)
})
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
