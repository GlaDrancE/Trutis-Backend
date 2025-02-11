import { z } from "zod";
export class Validator {
  cosntructor() { }
  static validateAdmin(data: Object) {
    try {
      const Admin = z.object({
        email: z.string().email(),
        password: z.string().min(6),
      });
      return Admin.parse(data);
    } catch (err: string | any) {
      throw new Error(err);
    }
  }
  static validateAgent(data: Object) {
    try {
      const Agent = z.object({
        name: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(6),
        address: z.string().min(3),
        phone: z.string().min(10),
        type_of_employment: z.string(),
        profile: z.string()
      });
      return Agent.parse(data);
    } catch (err: string | any) {
      throw new Error(err);
    }
  }
  static validateClient(data: Object) {
    try {
      const Client = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        shop_name: z.string().min(3),
        owner_name: z.string().min(2),
        address: z.string().min(5),
        phone: z.string().regex(/^[0-9]{10}$/),
      });
      return Client.parse(data);
    } catch (err: any) {
      return null; // Return null instead of throwing error
    }
  }
}
