import { createSelectSchema } from 'drizzle-zod';
import { educationLevelEnum, bookmarkedEvents, projects, users, events, subscribedCompanies, majors, companies, equipmentRentalType, equipmentItem, equipmentRentals, files, sponsors, officers } from '@/db/schema';

import { csFieldsEnum } from '@/db/schema';
import { z } from 'zod';

export const companySchema = createSelectSchema(companies);
export const subscribedCompanySchema = createSelectSchema(subscribedCompanies);
export const companyIDSchema = z.object({
	companyID: z.string(),
});
export const eventSchema = createSelectSchema(events).extend({
	tags: z.array(z.enum(csFieldsEnum.enumValues)),
	urls: z.array(z.string()),
});
export const userSchema = createSelectSchema(users).extend({
	interests: z.array(z.enum(csFieldsEnum.enumValues)),
});
export const equipmentRentalTypeSchema = createSelectSchema(equipmentRentalType);
export const equipmentItemSchema = createSelectSchema(equipmentItem);
export const equipmentRentalSchema = createSelectSchema(equipmentRentals);
export const eventIDSchema = z.object({
	eventID: z.string(),
});
export const fileSchema = createSelectSchema(files);
export const majorSchema = createSelectSchema(majors);
export const projectIDSchema = z.object({
	projectID: z.string(),
});
export const projectSchema = createSelectSchema(projects);
export const bookmarkSchema = createSelectSchema(bookmarkedEvents);	
export const updateUserSchema = z.object({
  major: z.string().optional(),
  gradDate: z.coerce.date().optional(),
  interests: z.array(z.enum(csFieldsEnum.enumValues)).optional(),
  education_level: z.enum(educationLevelEnum.enumValues).optional(),
  discord: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  website: z.string().optional(),
});
export const userIdSchema = z.object({
  userId: z.string(),
});
export const sponsorSchema = createSelectSchema(sponsors);
export const equipmentTypeIdSchema = z.object({
  equipmentTypeId: z
    .string()
    .openapi({
      param: {
        name: 'equipmentTypeId',
        in: 'path',
      },
    }),
});
export const officerSchema = createSelectSchema(officers);
