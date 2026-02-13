export class ProductionValidationService {
  ensurePositive(value: number, fieldName: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${fieldName} deve essere maggiore di zero`);
    }
  }

  ensureRequired(value: string | undefined, fieldName: string): void {
    if (!value || !value.trim()) {
      throw new Error(`${fieldName} è obbligatorio`);
    }
  }
}
