import { z } from "zod";

// Vehicle form validation schema
export const vehicleSchema = z.object({
  manufacturer: z.string().min(1, "Manufacturer is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1886, "Invalid year").max(new Date().getFullYear() + 1, "Invalid year"),
  color: z.string().optional(),
  mileage: z.number().min(0, "Mileage must be positive").optional(),
  engine: z.string().min(1, "Engine is required"),
  horsepower: z.number().min(0, "Horsepower must be positive").optional(),
  transmission: z.string().min(1, "Transmission is required"),
  drivetrain: z.string().optional(),
  description: z.string().optional(),
  visibility: z.enum(["public", "private"]),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
