UPDATE `configuracion`
SET
	`activo_efectivo` = COALESCE((
		SELECT ROUND(SUM(
			CASE
				WHEN `operaciones`.`pagos_realizados` >= `planes`.`cuotas` THEN 0
				ELSE MAX(0, ROUND(
					`operaciones`.`monto` -
					ROUND(`operaciones`.`monto` / `planes`.`cuotas`, 2) * `operaciones`.`pagos_realizados`,
					2
				))
			END
		), 2)
		FROM `operaciones`
		INNER JOIN `clientes` ON `clientes`.`id` = `operaciones`.`cliente_id`
		INNER JOIN `planes` ON `planes`.`id` = `operaciones`.`plan_id`
		WHERE
			`clientes`.`empresa_id` = `configuracion`.`empresa_id` AND
			`planes`.`empresa_id` = `configuracion`.`empresa_id` AND
			`operaciones`.`modalidad` = 'Efectivo'
	), 0),
	`activo_transferencia` = COALESCE((
		SELECT ROUND(SUM(
			CASE
				WHEN `operaciones`.`pagos_realizados` >= `planes`.`cuotas` THEN 0
				ELSE MAX(0, ROUND(
					`operaciones`.`monto` -
					ROUND(`operaciones`.`monto` / `planes`.`cuotas`, 2) * `operaciones`.`pagos_realizados`,
					2
				))
			END
		), 2)
		FROM `operaciones`
		INNER JOIN `clientes` ON `clientes`.`id` = `operaciones`.`cliente_id`
		INNER JOIN `planes` ON `planes`.`id` = `operaciones`.`plan_id`
		WHERE
			`clientes`.`empresa_id` = `configuracion`.`empresa_id` AND
			`planes`.`empresa_id` = `configuracion`.`empresa_id` AND
			`operaciones`.`modalidad` = 'Transferencia'
	), 0);
