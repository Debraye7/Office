/**
 * Helper para manejar dinero en centavos.
 * Internamente todo se guarda como entero.
 * Externamente se expone en decimales con 2 dígitos.
 */
export class Money {
  private cents: number;

  private constructor(cents: number) {
    this.cents = cents;
  }

  /** Crea Money desde un decimal (ej. 10.50) */
  static fromDecimal(amount: number): Money {
    return new Money(Math.round(amount * 100));
  }

  /** Crea Money directamente desde centavos (ej. 1050) */
  static fromCents(cents: number): Money {
    return new Money(cents);
  }

  /** Obtiene el valor en centavos (ej. 1050) */
  toCents(): number {
    return this.cents;
  }

  /** Obtiene el valor en decimal (ej. 10.50) */
  toDecimal(): number {
    return this.cents / 100;
  }

  /** Obtiene un string formateado como moneda (ej. "$10.50") */
  format(locale = "es-MX", currency = "MXN"): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(this.toDecimal());
  }

  /** Suma otro Money */
  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  /** Resta otro Money */
  subtract(other: Money): Money {
    return new Money(this.cents - other.cents);
  }
};
