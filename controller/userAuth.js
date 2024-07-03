const ProManageUser = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Bad Request",
      });
    }

    const isExistingUser = await ProManageUser.findOne({ email: email });

    if (isExistingUser) {
      return res.status(409).json({
        message: "User already exists",
        isExistingUser: true,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = new ProManageUser({
      name,
      email,
      password: hashedPassword,
    });

    await userData.save();

    res.json({
      message: "User registered successfully",
      email: userData.email,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Bad Request",
      });
    }

    const userDetails = await ProManageUser.findOne({ email });

    if (!userDetails) {
      return res.status(401).json({ message: "User does not exist" });
    }

    const passwordMatch = await bcrypt.compare(password, userDetails.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { email: userDetails.email },
      process.env.SECRET_CODE,
      {
        expiresIn: "60h",
      }
    );

    res.json({
      message: "User logged in",
      proManageToken: token,
      email: userDetails.email,
      name: userDetails.name,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const updateUserName = async (req, res, next) => {
  try {
    const email = req.query.email || "";
    const name = req.query.name || "";

    if (!email || !name) {
      return res.status(400).json({
        message: "Bad Request",
      });
    }

    const userDetails = await ProManageUser.findOne({
      email,
    });

    if (!userDetails) {
      return res.status(400).json({
        message: "Bad request",
      });
    }

    await ProManageUser.updateOne(
      { email: email },
      {
        $set: {
          name: name,
          email: userDetails?.email,
          password: userDetails?.password,
        },
      }
    );

    res.json({ message: "Username updated successfully" });
  } catch (error) {
    next(error);
  }
};

const updateUserDetails = async (req, res, next) => {
  try {
    const email = req.query.email || "";
    const userData = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Bad Request",
      });
    }

    const userDetails = await ProManageUser.findOne({
      email,
    });

    if (!userDetails) {
      return res.status(400).json({
        message: "Bad request",
      });
    }

    if (
      userData?.oldPassword.length === 0 &&
      userData?.newPassword.length === 0
    ) {
      await ProManageUser.updateOne(
        { email: email },
        {
          $set: {
            name: userData?.name,
            email: userData?.email,
            password: userDetails?.password,
          },
        }
      );
      res.json({ message: "Email updated successfully", updated: true });
    }

    const passwordMatch = await bcrypt.compare(
      userData?.oldPassword,
      userDetails?.password
    );

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "Password did not match", passwordMatch: false });
    } else {
      const hashedPassword = await bcrypt.hash(userData?.newPassword, 10);

      await ProManageUser.updateOne(
        { email: email },
        {
          $set: {
            name: userData?.name,
            email: userData?.email,
            password: hashedPassword,
          },
        }
      );

      res.json({ message: "User details updated successfully", updated: true });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, updateUserName, updateUserDetails };
