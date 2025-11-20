import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de sorteios da Mega-Sena
 * Armazena histórico completo de todos os sorteios
 */
export const draws = mysqlTable("draws", {
  id: int("id").autoincrement().primaryKey(),
  /** Número do concurso */
  contest: int("contest").notNull().unique(),
  /** Data do sorteio */
  drawDate: timestamp("drawDate").notNull(),
  /** Bola 1 (1-60) */
  ball1: int("ball1").notNull(),
  /** Bola 2 (1-60) */
  ball2: int("ball2").notNull(),
  /** Bola 3 (1-60) */
  ball3: int("ball3").notNull(),
  /** Bola 4 (1-60) */
  ball4: int("ball4").notNull(),
  /** Bola 5 (1-60) */
  ball5: int("ball5").notNull(),
  /** Bola 6 (1-60) */
  ball6: int("ball6").notNull(),
  /** Número de ganhadores com 6 acertos */
  winners6: int("winners6").default(0),
  /** Prêmio total (em centavos para evitar problemas com decimais) */
  prize: int("prize").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Draw = typeof draws.$inferSelect;
export type InsertDraw = typeof draws.$inferInsert;