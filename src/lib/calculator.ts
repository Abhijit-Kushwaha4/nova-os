export function calculate(expr: string): string {
  try {
    // allow only safe characters
    if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
      return "Error"
    }
    const result = Function(`return (${expr})`)()
    return String(result)
  } catch {
    return "Error"
  }
}
