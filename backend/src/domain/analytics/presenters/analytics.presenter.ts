
export class AnalyticsPresenter {
  static toHttp(analytics: any) {
    return {
      id: analytics.id,
      user_id: analytics.user_id,
      medication_id: analytics.medication_id,
      date: analytics.date instanceof Date ? analytics.date.toISOString() : analytics.date,
      risk_score: analytics.risk_score,
      created_at: analytics.created_at instanceof Date ? analytics.created_at.toISOString() : analytics.created_at,
      updated_at: analytics.updated_at instanceof Date ? analytics.updated_at.toISOString() : analytics.updated_at
    }
  }

  static toHttpList(analyticsList: any[]) {
    return analyticsList.map((analytics) => this.toHttp(analytics));
  }
}