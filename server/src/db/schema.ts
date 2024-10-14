import { text, timestamp, date, integer, bigint, pgEnum, pgTable, serial, time, numeric } from 'drizzle-orm/pg-core';

// Enums
export const eventsEnum = pgEnum('events_enum', ['workshop', 'seminar', 'hackathon', 'conference', 'meetup', 'test', 'other']);
export const csFieldsEnum = pgEnum('cs_fields_enum', ['web development', 'machine learning', 'cloud computing', 'artificial intelligence']);
export const targetAudienceEnum = pgEnum('target_audience_enum', ['students']);
export const equipmentConditionEnum = pgEnum('equipment_condition_enum', ['ready', 'broken', 'in maintenance']);
export const membershipTermEnum = pgEnum('membership_term_enum', ['semester', 'annual']);
export const membershipRequestStatusEnum = pgEnum('membership_request_status_enum', ['pending', 'approved', 'declined']);
export const industryEnum = pgEnum('industry_enum', ['investment banking', 'aerospace', 'healthcare']);
export const officerPositionEnum = pgEnum('officer_position_enum', ['president', 'vice president', 'dev team officer', 'treasurer', 'social media manager']);

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
  condition: equipmentConditionEnum('condition').notNull().default('ready'),
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
});

export const files = pgTable('files', {
  key: text('key').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const eventsFiles = pgTable('events_files', {
  eventId: integer('event_id').notNull().references(() => events.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  fileKey: text('file_key').notNull().references(() => files.key, { onUpdate: 'cascade', onDelete: 'cascade' }),
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
  githubLink: text('github_link'),
});

export const projectsFiles = pgTable('projects_files', {
  projectId: integer('project_id').notNull().references(() => projects.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  fileKey: text('file_key').notNull().references(() => files.key, { onUpdate: 'cascade', onDelete: 'cascade' }),
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