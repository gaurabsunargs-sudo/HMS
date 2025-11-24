import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password is required").optional(),
  roles: z.array(z.number()).min(1, "Select at least one role"),
});

export type FormValues = z.infer<typeof formSchema>;
