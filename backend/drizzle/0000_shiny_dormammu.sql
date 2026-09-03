CREATE TABLE `clientes` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`nombre` text NOT NULL,
	`dni` text NOT NULL,
	`telefono` text DEFAULT '' NOT NULL,
	`direccion` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `configuracion` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`limite_reserva` real DEFAULT 0 NOT NULL,
	`caja_efectivo` real DEFAULT 0 NOT NULL,
	`caja_transferencia` real DEFAULT 0 NOT NULL,
	`activo_efectivo` real DEFAULT 0 NOT NULL,
	`activo_transferencia` real DEFAULT 0 NOT NULL,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `empresas` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `operaciones` (
	`id` text PRIMARY KEY NOT NULL,
	`cliente_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`monto` real NOT NULL,
	`modalidad` text NOT NULL,
	`motivo` text DEFAULT '' NOT NULL,
	`total_devolver` real NOT NULL,
	`cuota_valor` real NOT NULL,
	`fecha_inicio` text NOT NULL,
	`pagos_realizados` integer DEFAULT 0 NOT NULL,
	`estado` text DEFAULT 'al-dia' NOT NULL,
	`proximo_vencimiento` text NOT NULL,
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`plan_id`) REFERENCES `planes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `planes` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`nombre` text NOT NULL,
	`cuotas` integer NOT NULL,
	`frecuencia` text NOT NULL,
	`interes` real NOT NULL,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
