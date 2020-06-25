import jwt from "express-jwt";

const getTokenFromHeader = (req: any) => {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

const secret = process.env.JWT_SECRET;
if (secret == undefined) {
  throw new Error("Couldn't find JWT_SECRET in enviroment or .env file");
}

const ValidateJWT = jwt({
  secret: secret,
  userProperty: "token",
  getToken: getTokenFromHeader,
});

export * from "jsonwebtoken";

export { ValidateJWT, getTokenFromHeader };
