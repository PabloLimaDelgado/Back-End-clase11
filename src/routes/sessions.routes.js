import { Router } from "express";
import { generateToken, compareData, hashData } from "../utils.js";
import { usersManager } from "../managers/usersManager.js";
import passport from "passport";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userDB = await usersManager.getByEmail(email);

    if (!userDB) {
      return res.status(401).message({ message: "Invalid credentials" });
    }

    const isValid = await compareData(password, userDB.password);
    console.log(isValid);
    if (!isValid) {
      return res.status(401).message({ meesage: "Invalid credentials" });
    }

    const token = generateToken({
      email,
      first_name: userDB.first_name,
      role: userDB.role,
    });
    console.log(token);
    res
      .status(200)
      .cookie("token", token, { httpOnly: true })
      .json({ message: `Welcome ${userDB.first_name}`, token });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.post("/singup", async (req, res) => {
  const { password, email, first_name, last_name } = req.body;

  if (!first_name || !last_name || !email || !password) {
    req.status(400).json({ message: "All fields are required" });
  }

  try {
    const userDB = await usersManager.getByEmail(email);

    if (userDB) {
      return res.status(401).message({ message: "User exist" });
    }

    const hashedPassword = await hashData(password);
    const createdUser = await usersManager.createOne({
      ...req.body,
      password: hashedPassword,
    });

    res.status(200).json({ message: "User created", user: createdUser });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// SINGUP - LOGIN - PASSPORT
/*router.post(
  "/singup",
  passport.authenticate("singup", {
    successRedirect: "/home",
    failureRedirect: "/error",
  })
);

router.post(
  "/login",
  passport.authenticate("login", {
    successRedirect: "/home",
    failureRedirect: "/error",
  })
); */

//GITHUB
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github",
  passport.authenticate("github", {
    failureRedirect: "/error",
  }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect("/home");
  }
);

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});
export default router;
