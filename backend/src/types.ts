export type View = "dashboard" | "cartera" | "operacion" | "config" | "cliente"

export type Frecuencia = "Diario" | "Quincenal" | "Mensual"

export type Modalidad = "Efectivo" | "Transferencia"

export interface Plan {
  id: string
  nombre: string
  cuotas: number
  frecuencia: Frecuencia
  interes: number
}

export interface CapitalSplit {
  efectivo: number
  transferencia: number
}

export interface Operacion {
  id: string
  clienteId: string
  monto: number
  modalidad: Modalidad
  motivo: string
  plan: Plan
  totalDevolver: number
  cuotaValor: number
  fechaInicio: string
  pagosRealizados: number
  estado: "al-dia" | "vence-pronto" | "mora"
  proximoVencimiento: string
}

export interface Cliente {
  id: string
  nombre: string
  dni: string
  telefono: string
  direccion: string
  operaciones: Operacion[]
}

export interface AppState {
  caja: CapitalSplit
  activo: CapitalSplit
  limiteReserva: number
  planes: Plan[]
  clientes: Cliente[]
}

export interface AuthTokenPayload {
  sub: string
  username: string
  name: string
  empresaId: string
  rol: string
  exp: number
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthTokenPayload
    }
  }
}
