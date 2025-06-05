import React, { useMemo } from "react"
import { Heart, Trophy, Target } from "lucide-react"
import { useTranslation } from "react-i18next"

// Define the props interface since it's imported
interface AdherenceSummaryProps {
  adherenceRate: number
  totalDoses: number
  takenDoses: number
  streakDays: number
}

// Memoize the adherence color calculation with friendlier gradients
const getAdherenceColor = (rate: number) => {
  if (rate >= 90) return "bg-gradient-to-r from-green-400 to-emerald-500"
  if (rate >= 70) return "bg-gradient-to-r from-blue-400 to-cyan-500"
  return "bg-gradient-to-r from-purple-400 to-pink-500"
}

// Memoize the adherence text calculation with encouraging messages
const getAdherenceText = (rate: number, t: (key: string) => string) => {
  if (rate >= 90) return t('adherence.summary.messages.excellent')
  if (rate >= 70) return t('adherence.summary.messages.good')
  if (rate >= 50) return t('adherence.summary.messages.fair')
  return t('adherence.summary.messages.needs_improvement')
}

// Get motivational emoji based on adherence rate
const getAdherenceEmoji = (rate: number, t: (key: string) => string) => {
  if (rate >= 90) return t('adherence.summary.emoji.excellent')
  if (rate >= 70) return t('adherence.summary.emoji.good')
  return t('adherence.summary.emoji.fair')
}

// Memoize the friendly stats card component
const FriendlyStatsCard = React.memo(
  ({
    icon: Icon,
    title,
    value,
    subtitle,
    bgGradient,
    emoji,
  }: {
    icon: React.ElementType
    title: string
    value: number
    subtitle: string
    bgGradient: string
    emoji: string
  }) => (
    <div
      className={`${bgGradient} text-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-6 h-6" />
        <span className="text-2xl">{emoji}</span>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <h4 className="text-white/90 font-medium mb-1">{title}</h4>
      <p className="text-white/70 text-sm">{subtitle}</p>
    </div>
  ),
)

export const AdherenceSummary: React.FC<AdherenceSummaryProps> = ({
  adherenceRate,
  totalDoses,
  takenDoses,
  streakDays,
}) => {
  const { t } = useTranslation()

  const adherenceColor = useMemo(() => getAdherenceColor(adherenceRate), [adherenceRate])
  const adherenceText = useMemo(() => getAdherenceText(adherenceRate, t), [adherenceRate, t])
  const adherenceEmoji = useMemo(() => getAdherenceEmoji(adherenceRate, t), [adherenceRate, t])

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-xl border-0 p-8">
      {/* Header with friendly title */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('adherence.summary.title')}</h3>
        <p className="text-gray-600">{t('adherence.summary.subtitle')}</p>
      </div>

      {/* Main Progress Card */}
      <div className={`${adherenceColor} text-white rounded-2xl p-6 mb-8 shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">{adherenceRate}% {t('adherence.summary.complete')}</h2>
            <p className="text-white/90">{adherenceText}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl mb-2">{adherenceEmoji}</div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">{t('adherence.summary.health_hero')}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/20 rounded-full h-3 mb-3">
          <div
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${adherenceRate}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-sm text-white/80">
          <span>{takenDoses} {t('adherence.summary.stats.doses')} {t('adherence.summary.stats.taken')}</span>
          <span>{totalDoses - takenDoses} {t('adherence.summary.stats.remaining')}</span>
        </div>
      </div>

      {/* Friendly Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FriendlyStatsCard
          icon={Heart}
          title={t('adherence.summary.stats.doses_taken')}
          value={takenDoses}
          subtitle={t('adherence.summary.stats.keep_up_work')}
          bgGradient="bg-gradient-to-br from-green-400 to-emerald-500"
          emoji="💚"
        />

        <FriendlyStatsCard
          icon={Trophy}
          title={t('adherence.summary.stats.streak_days')}
          value={streakDays}
          subtitle={streakDays >= 7 ? t('adherence.summary.stats.on_fire') : t('adherence.summary.stats.building_momentum')}
          bgGradient="bg-gradient-to-br from-orange-400 to-red-500"
          emoji="🔥"
        />

        <FriendlyStatsCard
          icon={Target}
          title={t('adherence.summary.stats.total_goal')}
          value={totalDoses}
          subtitle={t('adherence.summary.stats.health_target')}
          bgGradient="bg-gradient-to-br from-purple-400 to-pink-500"
          emoji="🎯"
        />
      </div>

      {/* Encouraging Message */}
      <div className="mt-8 text-center bg-white/50 rounded-xl p-6 border border-white/20">
        <div className="text-3xl mb-3">🌟</div>
        <h4 className="text-lg font-bold text-gray-800 mb-2">
          {adherenceRate >= 80 ? t('adherence.summary.encouragement.fantastic') : t('adherence.summary.encouragement.every_dose')}
        </h4>
        <p className="text-gray-600">
          {adherenceRate >= 80
            ? t('adherence.summary.encouragement.commitment')
            : t('adherence.summary.encouragement.investment')}
        </p>
      </div>
    </div>
  )
}

export default AdherenceSummary
