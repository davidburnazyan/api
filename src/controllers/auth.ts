import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/user";
import { Request, Response } from "express";
import { generateJWT } from "../utils/jwtToken";
import { generateHashedPassword } from "../utils/generateHashePassword";
import user from "../models/user";

interface IBody {
  email: string;
  name: string;
  surname: string;
  password: string;
}

export const signIn = (req: Request, res: Response) => {
  user
    .findOne({ email: req.body.email })
    .then(async (response) => {
      if (response) {
        if (response.password) {
          const bcryptResponse = await bcrypt.compare(req.body.password, response.password)

          if (bcryptResponse) {
            res.json({
              access_token: response.access_token,
              refresh_token: response.refresh_token
            });
          }
          return
        }
      }

      res.json({
        message: 'Something went wrong/'
      });
    })
};

export const signUp = async (req: Request, res: Response) => {
  const { email, name, surname, password }: IBody = req.body;

  try {
    const hashedPassword = await generateHashedPassword(password);

    if (!hashedPassword) {
      throw new Error("-------hashedPassword");
    }

    const token = await generateJWT({ email, password: hashedPassword });

    if (token) {
      const user = await User.create({
        email,
        name,
        surname,
        password: hashedPassword,
        access_token: token,
        refresh_token: token,
      });

      res.json({
        user,
      });
    }
  } catch (err) {
    console.log("Error: ", err);
  }
};

export const getUserInfo = (req: Request, res: Response) => {
  const bearerToken = req.headers.authorization as string;

  const splitted = bearerToken.split(' ')

  if (splitted.length !== 2) {
    res.json({
      message: "Something went wrong."
    })
  }

  user
    .findOne({ access_token: splitted[1] })
    .then(async (response) => {
      console.log(response);

      if (response) {
        res.json({
          email: response.email,
          name: response.name,
          surname: response.surname,
        });
      }
    })
};
