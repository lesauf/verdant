// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';

export default {
  journal,
  migrations: {
    m0000: `CREATE TABLE \`blocks\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`name\` text NOT NULL,
	\`area_ha\` real NOT NULL,
	\`status\` text NOT NULL,
	\`geo_json\` text,
	\`created_at\` integer NOT NULL,
	\`updated_at\` integer NOT NULL,
	\`last_synced_at\` integer
);
--> statement-breakpoint
CREATE TABLE \`tasks\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`title\` text NOT NULL,
	\`status\` text NOT NULL,
	\`block_id\` text,
	\`assigned_to\` text,
	\`due_date\` integer,
	\`is_synced\` integer DEFAULT false,
	\`created_at\` integer NOT NULL,
	FOREIGN KEY (\`block_id\`) REFERENCES \`blocks\`(\`id\`) ON UPDATE no action ON DELETE no action
);`
  }
}