import passport from "passport";
import { usersManager } from "./managers/usersManager.js";
import { hashData, compareData } from "./utils.js";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GituhbStrategy } from "passport-github2";

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
      callbackURL: "http://localhost:8080/api/users/github",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      try {
        const userDB = usersManager.getByEmail(profile.email);

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
          first_name: "prueba",
          last_name: "test",
          email: profile.email,
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
