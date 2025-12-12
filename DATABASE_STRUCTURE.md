# Database Structure Explanation

## The `db/` Folder - Keep It! ✅

**Answer**: The `db/` folder should **NOT** be moved or removed. It serves a different purpose than `src/data/`.

## Why Two Separate Folders?

### `/db/` - Database Configuration (Infrastructure)
**Purpose**: Drizzle ORM setup and schema definitions
**Contents**:
- `client.ts` - Database connection (Expo SQLite)
- `schema.ts` - Table definitions (Drizzle schema)

**Why at root?**
- Drizzle convention
- Used by migrations (`drizzle.config.ts` references it)
- Infrastructure concern, not application logic

```typescript
// db/client.ts - Infrastructure setup
import { drizzle } from "drizzle-orm/expo-sqlite";
export const db = drizzle(expoDb, { schema });

// db/schema.ts - Table definitions
export const blocks = sqliteTable("blocks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  // ...
});
```

### `/src/data/` - Application Data Layer
**Purpose**: Clean Architecture data layer
**Contents**:
- `repositories/` - Domain-aware data access classes
- `mappers/` - Convert DB ↔ Domain entities
- `sources/` - Future: external APIs, Supabase

```typescript
// src/data/repositories/BlockRepository.ts - Application logic
import { db } from '../../../db/client';      // Uses infrastructure
import { blocks } from '../../../db/schema';  // Uses schema

export class BlockRepository {
  async findAll(): Promise<Block[]> {  // Returns domain entities
    const rows = await db.select().from(blocks);
    return rows.map(blockMapper.toDomain);
  }
}
```

## The Relationship

```
Drizzle Config ─┐
                ├──> db/ (Infrastructure)
Migrations ─────┘     ├── client.ts (SQLite connection)
                      └── schema.ts (Table definitions)
                           ↓ imports
                      src/data/ (Application)
                      ├── repositories/ (Use the db client)
                      └── mappers/ (Domain ↔ DB conversion)
```

## Cleanup Done ✅

**Removed**: `db/repositories/` (old, unused files)
- These were legacy repository implementations
- Replaced by `src/data/repositories/` with Clean Architecture

**Kept**: `db/` folder with:
- ✅ `client.ts` - Database client
- ✅ `schema.ts` - Drizzle schema
- ✅ Used by `src/data/repositories/`
- ✅ Referenced by `drizzle.config.ts`

## Summary

**`db/`** = Infrastructure (Drizzle setup, schema)
**`src/data/`** = Application (repositories, business logic)

Both are needed! This is correct architecture. 🎯
