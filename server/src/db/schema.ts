import { boolean, text, timestamp, date, integer, bigint, pgEnum, pgTable, serial, time, numeric, varchar } from 'drizzle-orm/pg-core';

// Enums
export const eventsEnum = pgEnum('events_enum', ['Workshop', 'seminar', 'Hackathon', 'Conference', 'Meetup', 'Tech Talk', 'Other']);
export const csFieldsEnum = pgEnum('cs_fields_enum', ['Web Development', 'Machine Learning', 'Cloud Computing', 'Artificial Intelligence', 'Networking', 'Cybersecurity', 'Mobile Development', 'Game Development', 'Data Science']);
export const targetAudienceEnum = pgEnum('target_audience_enum', ['Students']);
export const equipmentConditionEnum = pgEnum('equipment_condition_enum', ['Ready', 'Broken', 'In Maintenance']);
export const membershipTermEnum = pgEnum('membership_term_enum', ['Semester', 'Annual']);
export const membershipRequestStatusEnum = pgEnum('membership_request_status_enum', ['Pending', 'Approved', 'Declined']);
export const industryEnum = pgEnum('industry_enum', ['Banking and Finance', 'Aerospace', 'Healthcare', 'Automotive', 'Energy', 'Technology']);
export const officerPositionEnum = pgEnum('officer_position_enum', ['President', 'Vice President', 'Dev Team Officer', 'Treasurer', 'Social Media Manager']);
export const educationLevelEnum = pgEnum('education_level_enum', ['Undergraduate', 'Graduate']);
export const projectStatusEnum = pgEnum('project_status_enum', ['Not Started', 'Looking for Members', 'In Progress', 'Completed']);
export const userRoleEnum = pgEnum('user_role_enum', ['user', 'member', 'admin']);
export const yearEnum = pgEnum('year_enum', ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Alumni']);

// Tables
export const majors = pgTable('majors', {
  name: text('name').primaryKey(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  major: text('major').notNull().references(() => majors.name),
  gradDate: date('grad_date').notNull(),
  interests: csFieldsEnum('interests').array().notNull().default([]),
  profilePic: text('profile_pic'),
  role: userRoleEnum('role').notNull().default('user'),
  paid: membershipTermEnum('paid'),
  education_level: educationLevelEnum('education_level').notNull(),
  discord: text('discord'),
  linkedin: text('linkedin'),
  github: text('github'),
  website: text('website'),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  activeExpires: bigint('active_expires', { mode: 'number' }).notNull(),
  idleExpires: bigint('idle_expires', { mode: 'number' }).notNull(),
});

export const userKey = pgTable('user_key', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  hashedPassword: text('hashed_password'),
});

export const equipmentRentalType = pgTable('equipment_rental_type', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  name: text('name').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  image: text('image'),
  description: text('description'),
});

export const equipmentItem = pgTable('equipment_item', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  equipmentType: integer('equipment_type').notNull().references(() => equipmentRentalType.id, { onUpdate: 'cascade' }),
});

export const equipmentRentals = pgTable('equipment_rentals', {
  itemId: integer('item_id').notNull().references(() => equipmentItem.id, { onUpdate: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onUpdate: 'cascade', onDelete: 'set null' }),
  dateBorrowed: date('date_borrowed').notNull().defaultNow(),
  returnDate: date('return_date').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  condition: equipmentConditionEnum('condition').notNull().default('Ready'),
}, (table) => ({
  primaryKey: [table.userId, table.itemId],
}));

export const blacklist = pgTable('blacklist', {
  userId: text('user_id').primaryKey().references(() => users.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  dateBlacklisted: timestamp('date_blacklisted').notNull().defaultNow(),
});

export const urls = pgTable('urls', {
  id: serial('id').primaryKey(),
  originalUrl: text('original_url').notNull(),
  shortUrl: text('short_url').notNull(),
});

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  description: text('description').notNull(),
  urls: text('urls').array().notNull().default([]),
  eventType: eventsEnum('event_type').notNull(),
  eventCapacity: integer('event_capacity'),
  image: text('image').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  tags: csFieldsEnum('tags').array().notNull().default([]),
  targetAudience: targetAudienceEnum('target_audience'),
  shortenedEventUrl: integer('shortened_event_url').references(() => urls.id, { onUpdate: 'cascade' }),
  memberOnly: boolean('member_only').notNull().default(false),
});

export const files = pgTable('files', {
  key: text('key').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const eventsFiles = pgTable('events_files', {
  eventId: integer('event_id').notNull().references(() => events.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  fileKey: text('file_key').notNull().references(() => files.key, { onUpdate: 'cascade' }),
}, (table) => ({
  primaryKey: [table.eventId, table.fileKey],
}));

export const bookmarkedEvents = pgTable('bookmarked_events', {
  userId: text('user_id').notNull().references(() => users.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  eventId: integer('event_id').notNull().references(() => events.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  bookmarkedDate: timestamp('bookmarked_date').notNull().defaultNow(),
}, (table) => ({
  primaryKey: [table.userId, table.eventId],
}));

export const subscribedEvents = pgTable('subscribed_events', {
  userId: text('user_id').notNull().references(() => users.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  eventId: integer('event_id').notNull().references(() => events.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  subscribedDate: timestamp('subscribed_date').notNull().defaultNow(),
}, (table) => ({
  primaryKey: [table.userId, table.eventId],
}));

export const attendingEvents = pgTable('attending_events', {
  userId: text('user_id').notNull().references(() => users.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  eventId: integer('event_id').notNull().references(() => events.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  attendingDate: timestamp('attending_date').notNull().defaultNow(),
}, (table) => ({
  primaryKey: [table.userId, table.eventId],
}));

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location'),
  description: text('description').notNull(),
  industryId: industryEnum('industry_id').notNull(),
  logo: text('logo').references(() => files.key, { onUpdate: 'cascade' }),
});

export const eventCompanies = pgTable('event_companies', {
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
}, (table) => ({
  primaryKey: [table.eventId, table.companyId],
}));

export const subscribedCompanies = pgTable('subscribed_companies', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  subscribedDate: timestamp('subscribed_date').notNull().defaultNow(),
}, (table) => ({
  primaryKey: [table.userId, table.companyId],
}));

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  status: projectStatusEnum('status').notNull().default('Not Started'),
  githubLink: text('github_link'),
});

export const projectsFiles = pgTable('projects_files', {
  projectId: integer('project_id').notNull().references(() => projects.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  fileKey: text('file_key').notNull().references(() => files.key, { onUpdate: 'cascade' }),
}, (table) => ({
  primaryKey: [table.projectId, table.fileKey],
}));

export const interestedInProjects = pgTable('interested_in_projects', {
  userId: text('user_id').notNull().references(() => users.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
}, (table) => ({
  primaryKey: [table.userId, table.projectId],
}));

export const officers = pgTable('officers', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  position: officerPositionEnum('position').notNull(),
  linkedin: text('linkedin'),
  photo: text('photo').references(() => files.key, { onUpdate: 'cascade' }),
});

export const sessions = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});

export const sponsors = pgTable('sponsors', {
  name: varchar('name',{ length: 100 }).primaryKey(),
  logoKey: text('logo_key').notNull(),
});

export const clubLinks = pgTable('club_links', {
  id: serial('id').primaryKey(),
  instagram: text('instagram'),
  discord: text('discord'),
  linkedin: text('linkedin'),
  memberApplication: text('member_application'),
});

export const landingSpotlights = pgTable('landing_spotlights', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id, { onUpdate: 'cascade' }),
  imageKey: text('image_key').notNull().references(() => files.key, { onUpdate: 'cascade' }),
});

export const landingQuestions = pgTable('landing_questions', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
});

export const paymentLinks = pgTable('payment_links', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  link: text('link').notNull(),
});

// Update types
export type UserKey = typeof userKey.$inferSelect;
export type NewUserKey = typeof userKey.$inferInsert;

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type EquipmentRentalType = typeof equipmentRentalType.$inferSelect;
export type NewEquipmentRentalType = typeof equipmentRentalType.$inferInsert;
export type EquipmentItem = typeof equipmentItem.$inferSelect;
export type NewEquipmentItem = typeof equipmentItem.$inferInsert;
export type EquipmentRental = typeof equipmentRentals.$inferSelect;
export type NewEquipmentRental = typeof equipmentRentals.$inferInsert;
export type Blacklist = typeof blacklist.$inferSelect;
export type NewBlacklist = typeof blacklist.$inferInsert;
export type Url = typeof urls.$inferSelect;
export type NewUrl = typeof urls.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type EventFile = typeof eventsFiles.$inferSelect;
export type NewEventFile = typeof eventsFiles.$inferInsert;
export type BookmarkedEvent = typeof bookmarkedEvents.$inferSelect;
export type NewBookmarkedEvent = typeof bookmarkedEvents.$inferInsert;
export type SubscribedEvent = typeof subscribedEvents.$inferSelect;
export type NewSubscribedEvent = typeof subscribedEvents.$inferInsert;
export type AttendingEvent = typeof attendingEvents.$inferSelect;
export type NewAttendingEvent = typeof attendingEvents.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type EventCompany = typeof eventCompanies.$inferSelect;
export type NewEventCompany = typeof eventCompanies.$inferInsert;
export type SubscribedCompany = typeof subscribedCompanies.$inferSelect;
export type NewSubscribedCompany = typeof subscribedCompanies.$inferInsert;
export type ProjectFile = typeof projectsFiles.$inferSelect;
export type NewProjectFile = typeof projectsFiles.$inferInsert;
export type InterestedInProject = typeof interestedInProjects.$inferSelect;
export type NewInterestedInProject = typeof interestedInProjects.$inferInsert;
export type Officer = typeof officers.$inferSelect;
export type NewOfficer = typeof officers.$inferInsert;
export type Major = typeof majors.$inferSelect;
export type NewMajor = typeof majors.$inferInsert;
export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
export type Sponsor = typeof sponsors.$inferInsert;
export type ClubLink = typeof clubLinks.$inferSelect;
export type NewClubLink = typeof clubLinks.$inferInsert;
export type LandingSpotlight = typeof landingSpotlights.$inferSelect;
export type NewLandingSpotlight = typeof landingSpotlights.$inferInsert;
export type LandingQuestion = typeof landingQuestions.$inferSelect;
export type NewLandingQuestion = typeof landingQuestions.$inferInsert;
export type PaymentLink = typeof paymentLinks.$inferSelect;
export type NewPaymentLink = typeof paymentLinks.$inferInsert;