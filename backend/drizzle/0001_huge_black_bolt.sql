CREATE TABLE `usuarios` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`nombre` text NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`rol` text DEFAULT 'admin' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_username_unique` ON `usuarios` (`username`);