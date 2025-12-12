ALTER TABLE `blocks` ADD `synced_at` integer;--> statement-breakpoint
ALTER TABLE `blocks` ADD `is_deleted` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `blocks` DROP COLUMN `last_synced_at`;--> statement-breakpoint
ALTER TABLE `tasks` ADD `description` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `start_date` integer;--> statement-breakpoint
ALTER TABLE `tasks` ADD `updated_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `synced_at` integer;--> statement-breakpoint
ALTER TABLE `tasks` ADD `is_deleted` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` DROP COLUMN `is_synced`;