export function ActivityFeed() {
  // TODO: 실제 데이터로 대체
  const activities = [
    {
      id: 1,
      user: '김철수',
      action: '업무를 완료했습니다',
      task: '블로그 포스팅 작성',
      time: '10분 전',
    },
    {
      id: 2,
      user: '이영희',
      action: '댓글을 남겼습니다',
      task: '네이버 키워드 순위 확인',
      time: '1시간 전',
    },
    {
      id: 3,
      user: '박민수',
      action: '새 업무를 생성했습니다',
      task: '운영 계정 비밀번호 변경',
      time: '2시간 전',
    },
  ]

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-neutral-500 text-sm">최근 활동이 없습니다</p>
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
