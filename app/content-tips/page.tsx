'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'

type ContentTip = {
  id: string
  title: string
  description: string
  linkType: string
  linkUrl: string
  thumbnailUrl: string | null
  category: string
  subCategory: string | null
  createdAt: string
  authorName: string
}

const CATEGORIES: Record<string, { name: string; icon: string }> = {
  ai: { name: 'AI 활용', icon: '🤖' },
  instagram: { name: '인스타그램', icon: '📸' },
  meta_ads: { name: 'Meta 광고', icon: '📊' },
  naver_blog: { name: '네이버 블로그', icon: '✍️' },
}

export default function ContentTipsPage() {
  const [tips, setTips] = useState<ContentTip[]>([])
  const [filteredTips, setFilteredTips] = useState<ContentTip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTip, setSelectedTip] = useState<ContentTip | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // 카테고리별 개수 계산
  const categoryCounts = {
    all: tips.length,
    ai: tips.filter(t => t.category === 'ai').length,
    instagram: tips.filter(t => t.category === 'instagram').length,
    meta_ads: tips.filter(t => t.category === 'meta_ads').length,
    naver_blog: tips.filter(t => t.category === 'naver_blog').length,
  }

  useEffect(() => {
    fetchContentTips()
  }, [])

  useEffect(() => {
    filterTips()
  }, [tips, selectedCategory, searchQuery])

  const fetchContentTips = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('https://www.polaai.co.kr/api/public/content-tips')

      if (!response.ok) {
        throw new Error('콘텐츠 팁을 불러오는데 실패했습니다')
      }

      const data = await response.json()

      if (data.success) {
        setTips(data.tips)
      } else {
        throw new Error(data.error || '알 수 없는 오류가 발생했습니다')
      }
    } catch (err) {
      console.error('콘텐츠 팁 조회 실패:', err)
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const filterTips = () => {
    let result = tips

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      result = result.filter(tip => tip.category === selectedCategory)
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        tip =>
          tip.title.toLowerCase().includes(query) ||
          tip.description.toLowerCase().includes(query) ||
          tip.authorName.toLowerCase().includes(query)
      )
    }

    setFilteredTips(result)
  }

  const extractYoutubeId = (url: string) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchContentTips}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                다시 시도
              </button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              💡 콘텐츠 제작 Tip
            </h1>
            <p className="text-neutral-600 mt-2">
              유용한 콘텐츠 제작 팁과 참고 자료
            </p>
          </div>
        </div>

        {/* Tab 네비게이션 */}
        <div className="border-b border-neutral-200">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-px">
            {/* 전체 Tab */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`
                min-w-[90px] md:min-w-[120px] px-4 md:px-6 py-2 md:py-3
                text-sm md:text-base font-medium whitespace-nowrap
                transition-all duration-200 flex-shrink-0
                ${
                  selectedCategory === 'all'
                    ? 'text-primary border-b-3 border-primary bg-primary/5'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }
              `}
              style={{ borderBottomWidth: selectedCategory === 'all' ? '3px' : '0' }}
            >
              <span className="hidden md:inline">전체 </span>
              <span className="md:hidden">전체</span>
              <span className="text-xs md:text-sm ml-1">({categoryCounts.all})</span>
            </button>

            {/* 카테고리 Tabs */}
            {Object.entries(CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`
                  min-w-[100px] md:min-w-[140px] px-3 md:px-6 py-2 md:py-3
                  text-sm md:text-base font-medium whitespace-nowrap
                  transition-all duration-200 flex items-center justify-center gap-1 md:gap-2 flex-shrink-0
                  ${
                    selectedCategory === key
                      ? 'text-primary border-b-3 border-primary bg-primary/5'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }
                `}
                style={{ borderBottomWidth: selectedCategory === key ? '3px' : '0' }}
              >
                <span className="text-base md:text-lg">{category.icon}</span>
                <span className="hidden md:inline">{category.name}</span>
                <span className="md:hidden text-xs">{category.name.replace(' ', '')}</span>
                <span className="text-xs md:text-sm">({categoryCounts[key as keyof typeof categoryCounts]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* 스크롤 힌트 (모바일) */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        {/* 검색 */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="제목, 설명, 작성자로 검색..."
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900"
                >
                  초기화
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 게시판 테이블 (Desktop & Tablet) */}
        <Card className="hidden md:block">
          <CardContent>
            {filteredTips.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                {searchQuery || selectedCategory !== 'all'
                  ? '검색 결과가 없습니다'
                  : '아직 등록된 콘텐츠 팁이 없습니다'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      {/* Desktop: 모든 컬럼 표시 */}
                      <th className="hidden lg:table-cell text-left py-3 px-4 font-semibold text-neutral-700 w-16">
                        번호
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700 min-w-[140px]">
                        카테고리
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                        제목
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700 w-24">
                        타입
                      </th>
                      {/* Desktop only */}
                      <th className="hidden lg:table-cell text-left py-3 px-4 font-semibold text-neutral-700 w-28">
                        작성자
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-700 w-32">
                        작성일
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTips.map((tip, index) => {
                      const category = CATEGORIES[tip.category]

                      return (
                        <tr
                          key={tip.id}
                          onClick={() => setSelectedTip(tip)}
                          className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors"
                        >
                          <td className="hidden lg:table-cell py-3 px-4 text-neutral-600">
                            {filteredTips.length - index}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <span className="text-lg">{category?.icon}</span>
                              <span className="text-sm font-medium text-neutral-700">
                                {category?.name}
                              </span>
                            </div>
                            {tip.subCategory && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded whitespace-nowrap">
                                {tip.subCategory}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-neutral-900">
                              {tip.title}
                            </div>
                            <div className="text-sm text-neutral-500 line-clamp-1 mt-1">
                              {tip.description}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {tip.linkType === 'youtube' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded whitespace-nowrap">
                                📺 YT
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded whitespace-nowrap">
                                🌐 Blog
                              </span>
                            )}
                          </td>
                          <td className="hidden lg:table-cell py-3 px-4 text-sm text-neutral-600">
                            {tip.authorName}
                          </td>
                          <td className="py-3 px-4 text-sm text-neutral-600 whitespace-nowrap">
                            {formatDate(tip.createdAt).replace(/\./g, '.')}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 모바일 카드 레이아웃 */}
        <div className="md:hidden space-y-3">
          {filteredTips.length === 0 ? (
            <Card>
              <CardContent>
                <div className="text-center py-12 text-neutral-500">
                  {searchQuery || selectedCategory !== 'all'
                    ? '검색 결과가 없습니다'
                    : '아직 등록된 콘텐츠 팁이 없습니다'}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredTips.map((tip, index) => {
              const category = CATEGORIES[tip.category]

              return (
                <Card
                  key={tip.id}
                  hover
                  onClick={() => setSelectedTip(tip)}
                  className="cursor-pointer"
                >
                  <CardContent className="p-4">
                    {/* 상단: 카테고리 + 타입 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{category?.icon}</span>
                        <div>
                          <div className="text-sm font-semibold text-neutral-900">
                            {category?.name}
                          </div>
                          {tip.subCategory && (
                            <div className="text-xs text-neutral-500 mt-0.5">
                              {tip.subCategory}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        {tip.linkType === 'youtube' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded">
                            📺 YT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                            🌐 Blog
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 중간: 제목 */}
                    <h3 className="font-bold text-neutral-900 mb-2 line-clamp-2">
                      {tip.title}
                    </h3>

                    {/* 설명 */}
                    <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                      {tip.description}
                    </p>

                    {/* 하단: 날짜 + 작성자 */}
                    <div className="flex items-center justify-between text-xs text-neutral-500 pt-3 border-t">
                      <span>{tip.authorName}</span>
                      <span>{formatDate(tip.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* 상세 모달 */}
      {selectedTip && (
        <Modal
          isOpen={!!selectedTip}
          onClose={() => setSelectedTip(null)}
          title={selectedTip.title}
        >
          <div className="space-y-4">
            {/* 카테고리 및 작성자 정보 */}
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {CATEGORIES[selectedTip.category]?.icon}
                </span>
                <div>
                  <div className="font-medium text-neutral-900">
                    {CATEGORIES[selectedTip.category]?.name}
                  </div>
                  {selectedTip.subCategory && (
                    <div className="text-xs text-neutral-500 mt-0.5">
                      {selectedTip.subCategory}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-neutral-500">
                <div>{selectedTip.authorName}</div>
                <div>{formatDate(selectedTip.createdAt)}</div>
              </div>
            </div>

            {/* 설명 */}
            <div className="bg-neutral-50 p-4 rounded-lg">
              <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                {selectedTip.description}
              </p>
            </div>

            {/* 유튜브 임베드 */}
            {selectedTip.linkType === 'youtube' && (
              <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden bg-neutral-100">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${extractYoutubeId(selectedTip.linkUrl)}`}
                  title={selectedTip.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {/* 블로그 미리보기 */}
            {selectedTip.linkType === 'blog' && selectedTip.thumbnailUrl && (
              <div
                className="relative w-full pb-[56.25%] rounded-lg overflow-hidden bg-neutral-100 bg-cover bg-center"
                style={{ backgroundImage: `url(${selectedTip.thumbnailUrl})` }}
              />
            )}

            {/* 버튼 */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedTip(null)}
                className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={() => window.open(selectedTip.linkUrl, '_blank', 'noopener,noreferrer')}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                새 창에서 열기
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
