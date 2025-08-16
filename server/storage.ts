import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { 
  goldRates, 
  displaySettings, 
  mediaItems, 
  promoImages, 
  bannerSettings,
  type GoldRate,
  type InsertGoldRate,
  type DisplaySettings,
  type InsertDisplaySettings,
  type MediaItem,
  type InsertMediaItem,
  type PromoImage,
  type InsertPromoImage,
  type BannerSettings,
  type InsertBannerSettings
} from "@shared/schema";
import { eq, desc, asc } from "drizzle-orm";
import { mkdirSync } from "fs";
import { join } from "path";

// Create uploads directory
const uploadsDir = join(process.cwd(), "uploads");
mkdirSync(uploadsDir, { recursive: true });

const sqlite = new Database("devi-jewellers.db");
const db = drizzle(sqlite);

// Initialize tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS gold_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gold_24k_sale REAL NOT NULL,
    gold_24k_purchase REAL NOT NULL,
    gold_22k_sale REAL NOT NULL,
    gold_22k_purchase REAL NOT NULL,
    gold_18k_sale REAL NOT NULL,
    gold_18k_purchase REAL NOT NULL,
    silver_per_kg_sale REAL NOT NULL,
    silver_per_kg_purchase REAL NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS display_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orientation TEXT DEFAULT 'horizontal',
    background_color TEXT DEFAULT '#FFF8E1',
    text_color TEXT DEFAULT '#212529',
    rate_number_font_size TEXT DEFAULT 'text-4xl',
    show_media INTEGER DEFAULT 1,
    rates_display_duration INTEGER DEFAULT 15,
    refresh_interval INTEGER DEFAULT 30,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS media_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    media_type TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 30,
    order_index INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    file_size INTEGER,
    mime_type TEXT,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS promo_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 5,
    transition_effect TEXT DEFAULT 'fade',
    order_index INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    file_size INTEGER,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS banner_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    banner_image_url TEXT,
    banner_height INTEGER DEFAULT 120,
    is_active INTEGER DEFAULT 1,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert default data if tables are empty
const defaultRates = db.select().from(goldRates).limit(1).all();
if (defaultRates.length === 0) {
  db.insert(goldRates).values({
    gold_24k_sale: 74850,
    gold_24k_purchase: 73200,
    gold_22k_sale: 68620,
    gold_22k_purchase: 67100,
    gold_18k_sale: 56140,
    gold_18k_purchase: 54900,
    silver_per_kg_sale: 92500,
    silver_per_kg_purchase: 90800,
    is_active: true
  }).run();
}

const defaultSettings = db.select().from(displaySettings).limit(1).all();
if (defaultSettings.length === 0) {
  db.insert(displaySettings).values({}).run();
}

export interface IStorage {
  // Gold Rates
  getCurrentRates(): Promise<GoldRate | undefined>;
  createGoldRate(rate: InsertGoldRate): Promise<GoldRate>;
  updateGoldRate(id: number, rate: Partial<InsertGoldRate>): Promise<GoldRate | undefined>;
  
  // Display Settings
  getDisplaySettings(): Promise<DisplaySettings | undefined>;
  updateDisplaySettings(id: number, settings: Partial<InsertDisplaySettings>): Promise<DisplaySettings | undefined>;
  
  // Media Items
  getMediaItems(activeOnly?: boolean): Promise<MediaItem[]>;
  createMediaItem(item: InsertMediaItem): Promise<MediaItem>;
  updateMediaItem(id: number, item: Partial<InsertMediaItem>): Promise<MediaItem | undefined>;
  deleteMediaItem(id: number): Promise<boolean>;
  
  // Promo Images
  getPromoImages(activeOnly?: boolean): Promise<PromoImage[]>;
  createPromoImage(image: InsertPromoImage): Promise<PromoImage>;
  updatePromoImage(id: number, image: Partial<InsertPromoImage>): Promise<PromoImage | undefined>;
  deletePromoImage(id: number): Promise<boolean>;
  
  // Banner Settings
  getBannerSettings(): Promise<BannerSettings | undefined>;
  updateBannerSettings(id: number, banner: Partial<InsertBannerSettings>): Promise<BannerSettings | undefined>;
}

export class SqliteStorage implements IStorage {
  // Gold Rates
  async getCurrentRates(): Promise<GoldRate | undefined> {
    const rates = db.select().from(goldRates)
      .where(eq(goldRates.is_active, true))
      .orderBy(desc(goldRates.created_date))
      .limit(1)
      .all();
    return rates[0];
  }

  async createGoldRate(rate: InsertGoldRate): Promise<GoldRate> {
    // Deactivate all existing rates
    db.update(goldRates).set({ is_active: false }).run();
    
    const result = db.insert(goldRates).values(rate).returning().get();
    return result;
  }

  async updateGoldRate(id: number, rate: Partial<InsertGoldRate>): Promise<GoldRate | undefined> {
    const result = db.update(goldRates)
      .set(rate)
      .where(eq(goldRates.id, id))
      .returning()
      .get();
    return result;
  }

  // Display Settings
  async getDisplaySettings(): Promise<DisplaySettings | undefined> {
    const settings = db.select().from(displaySettings)
      .orderBy(desc(displaySettings.created_date))
      .limit(1)
      .all();
    return settings[0];
  }

  async updateDisplaySettings(id: number, settings: Partial<InsertDisplaySettings>): Promise<DisplaySettings | undefined> {
    const result = db.update(displaySettings)
      .set(settings)
      .where(eq(displaySettings.id, id))
      .returning()
      .get();
    return result;
  }

  // Media Items
  async getMediaItems(activeOnly = false): Promise<MediaItem[]> {
    if (activeOnly) {
      return db.select().from(mediaItems)
        .where(eq(mediaItems.is_active, true))
        .orderBy(asc(mediaItems.order_index))
        .all();
    }
    
    return db.select().from(mediaItems)
      .orderBy(asc(mediaItems.order_index))
      .all();
  }

  async createMediaItem(item: InsertMediaItem): Promise<MediaItem> {
    const result = db.insert(mediaItems).values(item).returning().get();
    return result;
  }

  async updateMediaItem(id: number, item: Partial<InsertMediaItem>): Promise<MediaItem | undefined> {
    const result = db.update(mediaItems)
      .set(item)
      .where(eq(mediaItems.id, id))
      .returning()
      .get();
    return result;
  }

  async deleteMediaItem(id: number): Promise<boolean> {
    const result = db.delete(mediaItems).where(eq(mediaItems.id, id)).run();
    return result.changes > 0;
  }

  // Promo Images
  async getPromoImages(activeOnly = false): Promise<PromoImage[]> {
    if (activeOnly) {
      return db.select().from(promoImages)
        .where(eq(promoImages.is_active, true))
        .orderBy(asc(promoImages.order_index))
        .all();
    }
    
    return db.select().from(promoImages)
      .orderBy(asc(promoImages.order_index))
      .all();
  }

  async createPromoImage(image: InsertPromoImage): Promise<PromoImage> {
    const result = db.insert(promoImages).values(image).returning().get();
    return result;
  }

  async updatePromoImage(id: number, image: Partial<InsertPromoImage>): Promise<PromoImage | undefined> {
    const result = db.update(promoImages)
      .set(image)
      .where(eq(promoImages.id, id))
      .returning()
      .get();
    return result;
  }

  async deletePromoImage(id: number): Promise<boolean> {
    const result = db.delete(promoImages).where(eq(promoImages.id, id)).run();
    return result.changes > 0;
  }

  // Banner Settings
  async getBannerSettings(): Promise<BannerSettings | undefined> {
    const banner = db.select().from(bannerSettings)
      .where(eq(bannerSettings.is_active, true))
      .orderBy(desc(bannerSettings.created_date))
      .limit(1)
      .all();
    return banner[0];
  }

  async updateBannerSettings(id: number, banner: Partial<InsertBannerSettings>): Promise<BannerSettings | undefined> {
    const result = db.update(bannerSettings)
      .set(banner)
      .where(eq(bannerSettings.id, id))
      .returning()
      .get();
    return result;
  }
}

export const storage = new SqliteStorage();
