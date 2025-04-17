import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import {
  educationLevelEnum,
  projects,
  users,
  events,
  subscribedCompanies,
  majors,
  companies,
  equipmentRentalType,
  equipmentItem,
  equipmentRentals,
  files,
  sponsors,
  officers,
  blacklist,
  csFieldsEnum,
  clubLinks,
  landingQuestions,
  landingSpotlights,
  membershipTermEnum,
  bookmarkedEvents,
  subscribedEvents,
  attendingEvents,
  urls,
  paymentLinks,
  eventsEnum,
  targetAudienceEnum,
  userRoleEnum,
} from '@/db/schema';

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
export const csFieldsEnumSchema = z.enum(csFieldsEnum.enumValues);
export const timestampEnumSchema = z.enum(['upcoming', 'today', 'past', 'all']);
export const eventTypesEnumSchema = z.enum(eventsEnum.enumValues);
export const targetAudienceEnumSchema = z.enum(targetAudienceEnum.enumValues);
export const userSchema = createSelectSchema(users).extend({
  interests: z.array(z.enum(csFieldsEnum.enumValues)),
});
export const equipmentRentalTypeSchema =
  createSelectSchema(equipmentRentalType);
export const equipmentItemSchema = createSelectSchema(equipmentItem);
export const equipmentRentalSchema = createSelectSchema(equipmentRentals);
export const eventIDSchema = z.object({
  eventID: z.string(),
});
export const fileSchema = createSelectSchema(files).extend({
  url: z.string().url(),
});
export const majorSchema = createSelectSchema(majors);
export const projectIDSchema = z.object({
  projectID: z.string(),
});
export const projectSchema = createSelectSchema(projects);
export const newProjectSchema = createInsertSchema(projects);
export const bookmarkedEvent = eventSchema.extend({
  bookmarkedDate: z.string(),
});
export const bookmarkedEventSchema = createSelectSchema(bookmarkedEvents);
export const subscribedEvent = eventSchema.extend({
  subscribedDate: z.string(),
});
export const subscribedEventSchema = createSelectSchema(subscribedEvents);
export const attendingEventSchema = createSelectSchema(attendingEvents);
export const urlSchema = createSelectSchema(urls);
export const attendingEvent = eventSchema.extend({
  attendingDate: z.string(),
});
export const subscribedCompany = companySchema.extend({
  subscribedDate: z.string(),
});
export const updateUserSchema = z.object({
  major: z.string().optional(),
  gradDate: z.coerce.date().optional(),
  interests: z.array(z.enum(csFieldsEnum.enumValues)).optional(),
  education_level: z.enum(educationLevelEnum.enumValues).optional(),
  paid: z.enum(membershipTermEnum.enumValues).nullable().optional(),
  discord: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  github: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
});
export const userIdSchema = z.object({
  userId: z.string(),
});
export const sponsorSchema = createSelectSchema(sponsors);
export const equipmentTypeIdSchema = z.object({
  equipmentTypeId: z.string().openapi({
    param: {
      name: 'equipmentTypeId',
      in: 'path',
    },
  }),
});
export const officerSchema = createSelectSchema(officers);
export const newBlacklistSchema = createInsertSchema(blacklist);
export const blacklistSchema = createSelectSchema(blacklist);
export const clubLinkSchema = createSelectSchema(clubLinks);
export const updateClubLinkSchema = z.object({
  instagram: clubLinkSchema.shape.instagram.optional(),
  linkedin: clubLinkSchema.shape.linkedin.optional(),
  discord: clubLinkSchema.shape.discord.optional(),
  memberApplication: clubLinkSchema.shape.memberApplication.optional(),
});
export const landingSpotlightSchema = createSelectSchema(landingSpotlights);
export const landingQuestionSchema = createSelectSchema(landingQuestions);
export const errorSchema = z.object({
  error: z.string(),
});
export const paymentLinkSchema = createSelectSchema(paymentLinks);
export const newPaymentLinkSchema = createInsertSchema(paymentLinks);
export const updatePaymentLinkSchema = z.object({
  name: paymentLinkSchema.shape.name.optional(),
  link: paymentLinkSchema.shape.link.optional(),
});
export const paymentIdSchema = z.object({
  paymentId: z.string().openapi({
    param: {
      name: 'paymentId',
      in: 'path',
    },
  }),
});
export const spotlightSchema = z.object({
  id: z.number(),
  type: z.enum(eventsEnum.enumValues),
  image: z.string(),
  name: z.string(),
  description: z.string(),
});

export const userFilterSchema = z.object({
  name: z.string().optional(),
  education_level: z.array(z.enum(educationLevelEnum.enumValues)).optional(),
  major: z.array(z.string()).optional(),
  role: z.array(z.enum(userRoleEnum.enumValues)).optional(),
  paid: z.array(z.enum(membershipTermEnum.enumValues)).optional(),
  page: z.string().optional(),
  per_page: z.string().optional(),
});

export const searchTypeEnum = z.enum(['event', 'project', 'company']);
export const searchResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: searchTypeEnum,
  similarity: z.number(),
});
