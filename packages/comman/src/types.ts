import { z } from "zod";

export const CreateUserSchema = z.object({
  username: z.string(),
  email: z.email(),
  password: z.string(),
});

export const getUserSignInSchema=z.object({
    username:z.string(),
    password:z.string(),
});

export const roomSchema=z.object({
    roomName:z.string()
});