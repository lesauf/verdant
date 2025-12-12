import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

const expoDb = openDatabaseSync("verdant.db");
export const db = drizzle(expoDb, { schema });

// Run migrations manually to avoid parsing issues
const runMigrations = () => {
  try {
    // Check if migrations have already been run by checking if tables exist
    const tables = expoDb.getAllSync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='blocks'"
    );
    
    if (tables.length === 0) {
      console.log("Running database migrations...");
      
      // Migration 0000: Create initial tables
      expoDb.execSync(`
        CREATE TABLE blocks (
          id text PRIMARY KEY NOT NULL,
          name text NOT NULL,
          area_ha real NOT NULL,
          status text NOT NULL,
          geo_json text,
          created_at integer NOT NULL,
          updated_at integer NOT NULL,
          last_synced_at integer
        );
      `);
      
      expoDb.execSync(`
        CREATE TABLE tasks (
          id text PRIMARY KEY NOT NULL,
          title text NOT NULL,
          status text NOT NULL,
          block_id text,
          assigned_to text,
          due_date integer,
          is_synced integer DEFAULT 0,
          created_at integer NOT NULL,
          FOREIGN KEY (block_id) REFERENCES blocks(id) ON UPDATE no action ON DELETE no action
        );
      `);
      
      console.log("Initial tables created.");
    }
    
    // Check if migration 0001 has been applied
    const columnsCheck = expoDb.getAllSync<{ name: string }>(
      "PRAGMA table_info(blocks)"
    );
    const hasSyncedAtColumn = columnsCheck.some((col) => col.name === "synced_at");
    
    if (!hasSyncedAtColumn) {
      console.log("Running migration 0001...");
      
      // Migration 0001: Add new columns and drop old ones
      expoDb.execSync(`ALTER TABLE blocks ADD synced_at integer;`);
      expoDb.execSync(`ALTER TABLE blocks ADD is_deleted integer DEFAULT 0 NOT NULL;`);
      
      // SQLite doesn't support DROP COLUMN in older versions, so we need to recreate the table
      // For now, we'll just leave last_synced_at (it won't hurt)
      
      expoDb.execSync(`ALTER TABLE tasks ADD description text;`);
      expoDb.execSync(`ALTER TABLE tasks ADD start_date integer;`);
      expoDb.execSync(`ALTER TABLE tasks ADD updated_at integer;`);
      expoDb.execSync(`ALTER TABLE tasks ADD synced_at integer;`);
      expoDb.execSync(`ALTER TABLE tasks ADD is_deleted integer DEFAULT 0 NOT NULL;`);
      
      // Note: is_synced column will remain for backward compatibility
      
      console.log("Migration 0001 completed.");
    }
    
    console.log("All migrations completed successfully.");
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  }
};

// Run migrations on initialization
runMigrations();
