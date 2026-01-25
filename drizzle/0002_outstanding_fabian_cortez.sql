PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`area_ha` real NOT NULL,
	`status` text NOT NULL,
	`geo_json` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`synced_at` integer,
	`is_deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_blocks`("id", "name", "area_ha", "status", "geo_json", "created_at", "updated_at", "synced_at", "is_deleted") SELECT "id", "name", "area_ha", "status", "geo_json", "created_at", "updated_at", "synced_at", "is_deleted" FROM `blocks`;--> statement-breakpoint
DROP TABLE `blocks`;--> statement-breakpoint
ALTER TABLE `__new_blocks` RENAME TO `blocks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text NOT NULL,
	`block_id` text,
	`assigned_to` text,
	`start_date` integer,
	`due_date` integer,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`synced_at` integer,
	`is_deleted` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`block_id`) REFERENCES `blocks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_tasks`("id", "title", "description", "status", "block_id", "assigned_to", "start_date", "due_date", "completed_at", "created_at", "updated_at", "synced_at", "is_deleted") SELECT "id", "title", "description", "status", "block_id", "assigned_to", "start_date", "due_date", "completed_at", "created_at", "updated_at", "synced_at", "is_deleted" FROM `tasks`;--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
ALTER TABLE `__new_tasks` RENAME TO `tasks`;