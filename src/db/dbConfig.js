import mongoose from "mongoose";

const URI =
  "mongodb+srv://limapablomdz:repili123@coder.bykusle.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(URI)
  .then(() => console.log("Conectado a la db"))
  .catch((error) => console.log(error));
