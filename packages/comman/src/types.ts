import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string(),
});

export const getUserSchema=z.object({
    email:z.email(),
    password:z.string(),
});

export const roomSchema=z.object({
    roomName:z.string()
});