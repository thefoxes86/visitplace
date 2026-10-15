import { boolean, doublePrecision, index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import type { DetailValues } from '../lib/category-types.ts'

// ── Auth (Better Auth + its admin plugin) ────────────────────────────────────

export const user = pgTable('user', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text(),
  /** `admin` or `editor`, see src/lib/permissions.ts. */
  role: text(),
  banned: boolean().default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const session = pgTable(
  'session',
  {
    id: text().primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text().notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonated_by'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('session_user_id_idx').on(t.userId)],
)

export const account = pgTable(
  'account',
  {
    id: text().primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text(),
    password: text(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('account_user_id_idx').on(t.userId)],
)

export const verification = pgTable(
  'verification',
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('verification_identifier_idx').on(t.identifier)],
)

// ── Content ──────────────────────────────────────────────────────────────────

/** Kinds of places: restaurants, B&Bs, cultural places, events… */
export const categories = pgTable('categories', {
  /** Stable key used in code (e.g. the Gusta page lists `restaurant`). */
  id: text().primaryKey(),
  /** URL segment in the admin: /admin/<slug>. */
  slug: text().notNull().unique(),
  /** Name on the site: legends, filters, labels. */
  label: text().notNull(),
  /** Name of the list in the admin. */
  adminLabel: text('admin_label').notNull(),
  /** "Nuovo …" in the admin. */
  singular: text().notNull(),
  /** Marker and label colour, as #rrggbb. */
  color: text().notNull(),
  /** Decides the fields of its places: id in src/lib/category-types.ts. */
  type: text().notNull().default('place'),
  /** Order of legends, filters and the admin menu. */
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

/** Every point of the tourist map: restaurants, B&Bs, cultural places and events. */
export const pois = pgTable(
  'pois',
  {
    /** Also the URL: /luoghi/<id>. */
    id: text().primaryKey(),
    category: text()
      .notNull()
      // A category can't be deleted while places use it.
      .references(() => categories.id, { onUpdate: 'cascade', onDelete: 'restrict' }),
    name: text().notNull(),
    summary: text().notNull(),
    description: text().notNull(),
    /** Part of the comune the place is in. */
    area: text().notNull(),
    lat: doublePrecision().notNull(),
    lon: doublePrecision().notNull(),
    /** Shown among the main attractions on the home page. */
    featured: boolean().notNull().default(false),
    /** Unpublished entries are only visible in the admin. */
    published: boolean().notNull().default(true),
    /** Cultural places: sub-section of Scopri (id in src/data/scopri.ts). */
    topic: text(),
    imageUrl: text('image_url'),
    address: text(),
    phone: text(),
    email: text(),
    website: text(),
    /** Fields of the category's type (src/lib/category-types.ts), e.g. difficulty of a trek. */
    details: jsonb().$type<DetailValues>().notNull().default({}),
    /** Events only. */
    startsAt: timestamp('starts_at'),
    endsAt: timestamp('ends_at'),
    /** Order on the map, which gives each place its number. */
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index('pois_category_idx').on(t.category)],
)
