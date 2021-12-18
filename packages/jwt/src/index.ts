import jwt from "jsonwebtoken";
import { Service, Provider, Container, HTTPError } from "@restyjs/core";

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

@Service()
class JWTProvider implements Provider {
  optional: boolean = false;
  private secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  build() {
    // process.env.JWTProvider_JWT_SECRET = this.secret;
  }

  public verify(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secret, (err: any, decoded: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(decoded);
      });
    });
  }

  public generate(
    payload: string | Buffer | object,
    options?: jwt.SignOptions
  ): string {
    return jwt.sign(payload, this.secret, options);
  }
}

const ValidateJWT = async (req: any, res: any, next: any) => {
  try {
    // const secret = process.env.JWTProvider_JWT_SECRET as string;
    const token = getTokenFromHeader(req);
    if (!token) {
      throw new HTTPError("Unauthorized", 401);
    }
    const provider: JWTProvider = Container.get(JWTProvider);
    const decoded = await provider.verify(token);
    req["token"] = decoded;
    return next();
  } catch (error) {
    if (error as jwt.JsonWebTokenError) {
      next(new HTTPError("Unauthorized, Token Expired", 401));
      return;
    }
    next(error);
  }
};

function JWTConfiguration(secret: string): JWTProvider {
  const provider = new JWTProvider(secret);
  Container.set(JWTProvider, provider);
  return provider;
}

declare global {
  namespace Express {
    export interface Request {
      token: any;
    }
  }
}

export { JWTConfiguration, JWTProvider, getTokenFromHeader, ValidateJWT };
