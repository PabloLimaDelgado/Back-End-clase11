import express from "express";
import MongoStore from "connect-mongo";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import handlebars from "express-handlebars";

import { __dirname } from "./utils.js";
import "./passport.js";
import "./db/dbConfig.js";

import { clientsCustomRouter } from "./routes/clientsCustom.routes.js";

import usersRouter from "./routes/users.routes.js";
import viewsRouter from "./routes/views.routes.js";
import sessionsRouter from "./routes/sessions.routes.js";
import clientsRouter from "./routes/clients.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//SESSION
app.use(
  session({
    store: new MongoStore({
      mongoUrl:
        "mongodb+srv://limapablomdz:repili123@coder.bykusle.mongodb.net/?retryWrites=true&w=majority",
    }),
    secret: "SESSION_KEY",
    cookie: { maxAge: 60000 },
  })
);
//PASSPORT
app.use(passport.initialize());
app.use(passport.session());

//HANDLEBARS
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

//ROUTES
app.use("/api/users", usersRouter);
app.use("/", viewsRouter);
app.use("/api/sessions", sessionsRouter);
//app.use("/api/clients", clientsRouter);
app.use("/api/clients", clientsCustomRouter.getRouter());

app.listen(8080, () => {
  console.log("Escuchando al puerto 8080");
});
