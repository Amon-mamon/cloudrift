import { z }  from 'zod'

export const registerSchema = z.object({
    first_name:z.string().min(2, "Firstname must be atleast 2 characters"),
    last_name:z.string().min(2,"Lastname must be atleast 2 characters"),
    email:z.string().email("Invalid Email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password:z.string(),
}).refine((data) => data.password === data.confirm_password,{
    message: "Password do not match",
    path:["confirm_password"]
})

export type RegisterSchema  = z.infer<typeof registerSchema>

