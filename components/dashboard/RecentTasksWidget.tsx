export function RecentTasksWidget() {
  // TODO: 실제 데이터로 대체
  const tasks = [
    { id: 1, title: '블로그 포스팅 작성', priority: 'high', dueDate: '2025-11-08' },
    { id: 2, title: '네이버 키워드 순위 확인', priority: 'medium', dueDate: '2025-11-09' },
    { id: 3, title: '운영 계정 비밀번호 변경', priority: 'low', dueDate: '2025-11-10' },
  ]

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  }

  const priorityLabels = {
    high: '긴급',
    medium: '보통',
    low: '낮음',
  }

  return (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <p className="text-neutral-500 text-sm">요청된 업무가 없습니다</p>
      ) : (
        tasks.map(task => (
          <div
            key={task.id}
            className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-neutral-900">{task.title}</h4>
                <p className="text-sm text-neutral-500 mt-1">마감: {task.dueDate}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  priorityColors[task.priority as keyof typeof priorityColors]
                }`}
              >
                {priorityLabels[task.priority as keyof typeof priorityLabels]}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
