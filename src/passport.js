import passport from "passport";
import { usersManager } from "./managers/usersManager.js";
import { hashData, compareData } from "./utils.js";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GituhbStrategy } from "passport-github2";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
const JWT_SECRET = "jwtSECRET";

//LOCAL STRATEGY
passport.use(
  "singup",
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const userDB = await usersManager.getByEmail(email);

        if (userDB) {
          return done(null, false);
        }

        const hashedPassword = await hashData(password);
        const createdUser = await usersManager.createOne({
          ...req.body,
          password: hashedPassword,
        });

        done(null, createdUser);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const userDB = await usersManager.getByEmail(email);
        if (!userDB) {
          return done(null, false);
        }
        const isValid = await compareData(password, userDB.password);
        if (!isValid) {
          return done(null, false);
        }
        done(null, userDB);
      } catch (error) {
        done(error);
      }
    }
  )
);

//GITHUB
passport.use(
  "github",
  new GituhbStrategy(
    {
      clientID: "Iv1.00b42f4fc1341b64",
      clientSecret: "7382ee911778fb3b364322c5b4e243e38721a91e",
      callbackURL: "http://localhost:8080/api/sessions/github",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userDB = usersManager.getByEmail(profile._json.email);

        //LOGIN
        if (userDB) {
          if (userDB.from_github) {
            return done(null, userDB);
          } else {
            return done(null, false);
          }
        }

        //SINGUP
        const newUser = {
          first_name: profile._json.name.split(" ")[0],
          last_name: profile._json.name.split(" ")[1] || "",
          email: profile._json.email || profile.emails[0].value,
          password: "abc",
          from_github: true,
        };

        const createdUser = await usersManager.createOne(newUser);
        done(null, createdUser);
      } catch (error) {
        done(error);
      }
    }
  )
);

//JWT

const fromCookies = (req) => {
  return req.cookies.token;
};

passport.use(
  "jwt",
  new JWTStrategy(
    {
      secretOrKey: JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromExtractors([fromCookies]),
    },
    async (jwt_payload, done) => {
      //console.log(jwt_payload);
      done(null, jwt_payload);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await usersManager.getById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
