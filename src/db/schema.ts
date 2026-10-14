import { boolean, doublePrecision, index, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

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

export const poiCategory = pgEnum('poi_category', ['restaurant', 'bnb', 'culture', 'events'])

/** Every point of the tourist map: restaurants, B&Bs, cultural places and events. */
export const pois = pgTable(
  'pois',
  {
    /** Also the URL: /luoghi/<id>. */
    id: text().primaryKey(),
    category: poiCategory().notNull(),
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
