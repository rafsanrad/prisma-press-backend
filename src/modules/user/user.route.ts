import { Router } from "express";
import { userContrller } from "./user.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/register", userContrller.registerUser);

router.get(
  "/me",
  //   (req: Request, res: Response, next: NextFunction) => {
  //     const { accessToken } = req.cookies;
  //     // console.log(cookies)
  //     const verifiedToken = jwtUtils.verifyToken(
  //       accessToken,
  //       config.jwt_access_secret,
  //     );
  //     // console.log(verifiedToken)

  //     if (!verifiedToken.success) {
  //       throw new Error(verifiedToken.error);
  //     }

  //     const { id, name, email, role } = verifiedToken.data as JwtPayload;
  //     // const requiredRoles=["ADMIN","AUTHOR","USER"]
  //     const requiredRoles = [Role.ADMIN, Role.AUTHOR, Role.USER];

  //     if (!requiredRoles.includes(role)) {
  //       return res.status(403).json({
  //         success: false,
  //         statusCode: httpStatus.FORBIDDEN,
  //         message: "Forbidden.You don't have permission to access this resource.",
  //       });
  //     }

  //     req.user = {
  //       id,
  //       name,
  //       email,
  //       role,
  //     };

  //     next();
  //   },
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  userContrller.getMyProfile,
);

router.put("/my-profile",auth(Role.ADMIN, Role.AUTHOR, Role.USER),userContrller.updateMyProfile)

export const userRoutes = router;
