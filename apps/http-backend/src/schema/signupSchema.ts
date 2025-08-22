import { z } from "zod";

const signupSchema = z.object({
  username: z.string(),
  email: z.email(),
  password: z.string(),
});

export default signupSchema;