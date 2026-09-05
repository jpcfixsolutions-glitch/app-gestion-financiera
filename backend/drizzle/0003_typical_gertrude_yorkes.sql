CREATE TABLE `movimientos_caja` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`tipo` text NOT NULL,
	`modalidad` text NOT NULL,
	`monto` real NOT NULL,
	`razon` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `movimientos_caja_empresa_idx` ON `movimientos_caja` (`empresa_id`);