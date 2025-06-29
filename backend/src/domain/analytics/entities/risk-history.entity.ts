
export class RiskHistory {
  constructor(
    public readonly id: string,
    public readonly user_id: string,
    public readonly medication_id: string,
    public readonly date: Date,
    public readonly risk_score: number,
    public readonly created_at: Date,
    public readonly updated_at: Date,
  ) { }
}