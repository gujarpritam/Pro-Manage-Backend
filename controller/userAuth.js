const ProManageUser = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(name);
    console.log(email);
    console.log(password);

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
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = { registerUser, loginUser };
