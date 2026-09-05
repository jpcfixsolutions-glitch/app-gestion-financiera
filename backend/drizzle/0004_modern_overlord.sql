CREATE TABLE `actividad` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`usuario_id` text NOT NULL,
	`usuario_nombre` text NOT NULL,
	`tipo` text NOT NULL,
	`titulo` text NOT NULL,
	`detalle` text DEFAULT '' NOT NULL,
	`monto` real,
	`created_at` text NOT NULL,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `actividad_empresa_fecha_idx` ON `actividad` (`empresa_id`,`created_at`);