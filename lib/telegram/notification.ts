// 텔레그램 알림 전송 유틸리티

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''

interface TelegramNotificationParams {
  taskNumber: number
  taskTitle: string
  historyStatus: string
  historyTitle: string
  historyContent?: string
  authorName: string
  taskUrl?: string
}

const statusEmoji: Record<string, string> = {
  making: '🔵',
  confirming: '🟡',
  in_progress: '🟠',
  completed: '🟢',
  on_hold: '⚪',
  cancelled: '🔴',
}

const statusLabel: Record<string, string> = {
  making: '제작중',
  confirming: '컨펌중',
  in_progress: '진행중',
  completed: '완료',
  on_hold: '보류',
  cancelled: '취소',
}

export async function sendTaskHistoryNotification(params: TelegramNotificationParams) {
  const {
    taskNumber,
    taskTitle,
    historyStatus,
    historyTitle,
    historyContent,
    authorName,
    taskUrl,
  } = params

  const emoji = statusEmoji[historyStatus] || '📋'
  const label = statusLabel[historyStatus] || historyStatus

  // 메시지 구성
  let message = `🔔 <b>새 작업 이력 추가</b>\n\n`
  message += `<b>업무:</b> #${taskNumber} ${taskTitle}\n`
  message += `<b>상태:</b> ${emoji} ${label}\n`
  message += `<b>제목:</b> ${historyTitle}\n`

  if (historyContent) {
    const truncatedContent = historyContent.length > 200 ? historyContent.substring(0, 200) + '...' : historyContent
    message += `<b>내용:</b>\n${truncatedContent}\n`
  }

  message += `\n<b>작성자:</b> ${authorName}\n`

  if (taskUrl) {
    message += `\n🔗 <a href="${taskUrl}">업무 바로가기</a>`
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Telegram notification failed:', data)
      return false
    }

    console.log('Telegram notification sent successfully')
    return true
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    return false
  }
}
