CREATE INDEX `clientes_empresa_idx` ON `clientes` (`empresa_id`);--> statement-breakpoint
CREATE INDEX `clientes_empresa_dni_idx` ON `clientes` (`empresa_id`,`dni`);--> statement-breakpoint
CREATE INDEX `configuracion_empresa_idx` ON `configuracion` (`empresa_id`);--> statement-breakpoint
CREATE INDEX `operaciones_cliente_idx` ON `operaciones` (`cliente_id`);--> statement-breakpoint
CREATE INDEX `operaciones_plan_idx` ON `operaciones` (`plan_id`);--> statement-breakpoint
CREATE INDEX `planes_empresa_idx` ON `planes` (`empresa_id`);--> statement-breakpoint
CREATE INDEX `usuarios_empresa_idx` ON `usuarios` (`empresa_id`);