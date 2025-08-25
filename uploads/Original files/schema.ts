import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Gold and Silver Rates
export const goldRates = sqliteTable("gold_rates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gold_24k_sale: real("gold_24k_sale").notNull(),
  gold_24k_purchase: real("gold_24k_purchase").notNull(),
  gold_22k_sale: real("gold_22k_sale").notNull(),
  gold_22k_purchase: real("gold_22k_purchase").notNull(),
  gold_18k_sale: real("gold_18k_sale").notNull(),
  gold_18k_purchase: real("gold_18k_purchase").notNull(),
  silver_per_kg_sale: real("silver_per_kg_sale").notNull(),
  silver_per_kg_purchase: real("silver_per_kg_purchase").notNull(),
  is_active: integer("is_active", { mode: "boolean" }).default(true),
  created_date: text("created_date").default(sql`CURRENT_TIMESTAMP`)
});

// Display Settings
export const displaySettings = sqliteTable("display_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orientation: text("orientation").default("horizontal"),
  background_color: text("background_color").default("#FFF8E1"),
  text_color: text("text_color").default("#212529"),
  rate_number_font_size: text("rate_number_font_size").default("text-4xl"),
  show_media: integer("show_media", { mode: "boolean" }).default(true),
  rates_display_duration: integer("rates_display_duration").default(15),
  refresh_interval: integer("refresh_interval").default(30),
  created_date: text("created_date").default(sql`CURRENT_TIMESTAMP`)
});

// Media Items (for ads between rates)
export const mediaItems = sqliteTable("media_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  file_url: text("file_url").notNull(),
  media_type: text("media_type").notNull(), // 'image' or 'video'
  duration_seconds: integer("duration_seconds").default(30),
  order_index: integer("order_index").default(0),
  is_active: integer("is_active", { mode: "boolean" }).default(true),
  file_size: integer("file_size"),
  mime_type: text("mime_type"),
  created_date: text("created_date").default(sql`CURRENT_TIMESTAMP`)
});

// Promotional Images (slideshow below silver rates)
export const promoImages = sqliteTable("promo_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  image_url: text("image_url").notNull(),
  duration_seconds: integer("duration_seconds").default(5),
  transition_effect: text("transition_effect").default("fade"),
  order_index: integer("order_index").default(0),
  is_active: integer("is_active", { mode: "boolean" }).default(true),
  file_size: integer("file_size"),
  created_date: text("created_date").default(sql`CURRENT_TIMESTAMP`)
});

// Banner Settings
export const bannerSettings = sqliteTable("banner_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  banner_image_url: text("banner_image_url"),
  banner_height: integer("banner_height").default(120),
  is_active: integer("is_active", { mode: "boolean" }).default(true),
  created_date: text("created_date").default(sql`CURRENT_TIMESTAMP`)
});

// Insert schemas
export const insertGoldRateSchema = createInsertSchema(goldRates).omit({
  id: true,
  created_date: true
});

export const insertDisplaySettingsSchema = createInsertSchema(displaySettings).omit({
  id: true,
  created_date: true
});

export const insertMediaItemSchema = createInsertSchema(mediaItems).omit({
  id: true,
  created_date: true
});

export const insertPromoImageSchema = createInsertSchema(promoImages).omit({
  id: true,
  created_date: true
});

export const insertBannerSettingsSchema = createInsertSchema(bannerSettings).omit({
  id: true,
  created_date: true
});

// Types
export type GoldRate = typeof goldRates.$inferSelect;
export type InsertGoldRate = z.infer<typeof insertGoldRateSchema>;

export type DisplaySettings = typeof displaySettings.$inferSelect;
export type InsertDisplaySettings = z.infer<typeof insertDisplaySettingsSchema>;

export type MediaItem = typeof mediaItems.$inferSelect;
export type InsertMediaItem = z.infer<typeof insertMediaItemSchema>;

export type PromoImage = typeof promoImages.$inferSelect;
export type InsertPromoImage = z.infer<typeof insertPromoImageSchema>;

export type BannerSettings = typeof bannerSettings.$inferSelect;
export type InsertBannerSettings = z.infer<typeof insertBannerSettingsSchema>;
