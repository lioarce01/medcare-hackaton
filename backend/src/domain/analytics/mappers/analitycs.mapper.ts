export class AnalyticsMapper {
  static toDomain(prismaAnalytics: any): any {
    // Asegurar que las fechas son Date o ISO string
    const createdAt =
      prismaAnalytics.created_at instanceof Date
        ? prismaAnalytics.created_at.toISOString()
        : prismaAnalytics.created_at;

    const updatedAt =
      prismaAnalytics.updated_at instanceof Date
        ? prismaAnalytics.updated_at.toISOString()
        : prismaAnalytics.updated_at;

    // Mapear el objeto a un dominio específico
    return {
      id: prismaAnalytics.id,
      user_id: prismaAnalytics.user_id,
      medication_id: prismaAnalytics.medication_id,
      date: prismaAnalytics.date instanceof Date ? prismaAnalytics.date.toISOString() : prismaAnalytics.date,
      risk_score: prismaAnalytics.risk_score,
      created_at: createdAt,
      updated_at: updatedAt
    }
  }
}