import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Endpoints table - stores monitored API information
export const endpoints = pgTable('endpoints', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  url: text('url').notNull(),
  method: varchar('method', { length: 10 }).notNull().default('GET'),
  headers: jsonb('headers'),
  expectedStatus: integer('expected_status').notNull().default(200),
  checkInterval: integer('check_interval').notNull().default(5), // in minutes
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// HealthLogs table - stores monitoring results and timestamps
export const healthLogs = pgTable('health_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  endpointId: uuid('endpoint_id')
    .notNull()
    .references(() => endpoints.id, { onDelete: 'cascade' }),
  statusCode: integer('status_code'),
  responseTimeMs: integer('response_time_ms'),
  success: boolean('success').notNull(),
  errorMessage: text('error_message'),
  checkedAt: timestamp('checked_at').notNull().defaultNow(),
});

// Alerts table - stores failure notifications
export const alerts = pgTable('alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  endpointId: uuid('endpoint_id')
    .notNull()
    .references(() => endpoints.id, { onDelete: 'cascade' }),
  alertType: varchar('alert_type', { length: 50 }).notNull(), // 'DOWN', 'SLOW', 'ERROR'
  message: text('message').notNull(),
  severity: varchar('severity', { length: 20 }).notNull().default('MEDIUM'), // 'LOW', 'MEDIUM', 'HIGH'
  isAcknowledged: boolean('is_acknowledged').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  acknowledgedAt: timestamp('acknowledged_at'),
});

// Relations
export const endpointsRelations = relations(endpoints, ({ many }) => ({
  healthLogs: many(healthLogs),
  alerts: many(alerts),
}));

export const healthLogsRelations = relations(healthLogs, ({ one }) => ({
  endpoint: one(endpoints, {
    fields: [healthLogs.endpointId],
    references: [endpoints.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  endpoint: one(endpoints, {
    fields: [alerts.endpointId],
    references: [endpoints.id],
  }),
}));

// Type exports
export type Endpoint = typeof endpoints.$inferSelect;
export type NewEndpoint = typeof endpoints.$inferInsert;

export type HealthLog = typeof healthLogs.$inferSelect;
export type NewHealthLog = typeof healthLogs.$inferInsert;

export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;
