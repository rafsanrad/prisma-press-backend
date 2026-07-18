import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { Result } from "pg";

const createToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: SignOptions,
) => {
  const token = jwt.sign(payload, secret, {
    expiresIn,
  } as SignOptions);
  return token;
};

const verifyToken=(token:string,secret:string)=>{
    // Result and error duitai return korte pare tai etake try catch block e rakhte hbe
    try {
        const verifiedToken=jwt.verify(token,secret)
        return {
            success:true,
            data:verifiedToken
        }
    } catch (error:any) {
        console.log("Token verification failed : ",error)
        return {
            success:false,
            error:error.message
        }
    }
}

export const jwtUtils = {
  createToken,
  verifyToken
};
