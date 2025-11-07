export function ActivityFeed() {
  const activities: any[] = []

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-neutral-500 text-sm">최근 활동이 없습니다</p>
        </div>
      ) : (
        activities.map(activity => (
          <div key={activity.id} className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-medium text-sm">
                {activity.user.charAt(0)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-900">
                <span className="font-medium">{activity.user}</span>님이{' '}
                <span className="text-neutral-600">{activity.action}</span>
              </p>
              <p className="text-sm text-primary truncate">{activity.task}</p>
              <p className="text-xs text-neutral-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
