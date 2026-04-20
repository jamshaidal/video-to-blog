const { z } = require("zod");
const { signup, login } = require("../services/authService");

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

async function signupController(req, res) {
  const payload = authSchema.parse(req.body);
  const result = await signup(payload.email.toLowerCase(), payload.password);

  res.status(201).json({
    success: true,
    ...result,
  });
}

async function loginController(req, res) {
  const payload = authSchema.parse(req.body);
  const result = await login(payload.email.toLowerCase(), payload.password);

  res.status(200).json({
    success: true,
    ...result,
  });
}

module.exports = {
  signupController,
  loginController,
};
