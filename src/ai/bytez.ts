import Bytez from "bytez.js"

const API_KEY = import.meta.env.VITE_BYTEZ_KEY

export const bytez = new Bytez(API_KEY)

export function getModel(model: string) {
  return bytez.model(model)
}
