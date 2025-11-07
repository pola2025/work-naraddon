'use client'

import { useState, useEffect } from 'react'
import { BlogPost } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { HiPlus, HiExternalLink } from 'react-icons/hi'
import { format } from 'date-fns'

interface BlogPostsListProps {
  onPostClick: (post: BlogPost) => void
  onCreatePost: () => void
}

export function BlogPostsList({ onPostClick, onCreatePost }: BlogPostsListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')

  const fetchPosts = async () => {
    try {
      const url = searchKeyword
        ? `/api/blog-posts?keyword=${encodeURIComponent(searchKeyword)}`
        : '/api/blog-posts'

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        console.log('=== 포스트 목록 조회 ===')
        console.log('받은 포스트 수:', data.posts.length)
        if (data.posts.length > 0) {
          console.log('첫 번째 포스트:', data.posts[0])
          console.log('monthKey:', data.posts[0]?.monthKey)
          console.log('serialNumber:', data.posts[0]?.serialNumber)
        }
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch blog posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [searchKeyword])

  const getLatestRanking = (post: BlogPost) => {
    if (!post.rankings || post.rankings.length === 0) return null
    return post.rankings[post.rankings.length - 1]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">블로그 포스팅 기록</h1>
          <p className="text-neutral-600 mt-2">블로그 포스팅의 검색 순위를 관리하세요</p>
        </div>
        <Button onClick={onCreatePost} variant="primary">
          <HiPlus className="mr-2" />
          포스팅 등록
        </Button>
      </div>

      {/* 검색 */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="키워드로 검색..."
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
          className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* 포스팅 목록 (테이블) */}
      {posts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-neutral-500">등록된 블로그 포스팅이 없습니다</p>
            <Button onClick={onCreatePost} variant="primary" className="mt-4">
              첫 포스팅 등록하기
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-24" /> {/* 번호 */}
                <col className="w-24" /> {/* 등록일 */}
                <col className="w-20" /> {/* 작성자 */}
                <col className="w-auto" /> {/* 블로그 제목 */}
                <col className="w-32" /> {/* 검색어 */}
                <col className="w-28" /> {/* 검색순위 */}
              </colgroup>
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    번호
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    등록일
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    작성자
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    블로그 제목
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    검색어
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    검색순위
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {posts.map(post => {
                  const latestRanking = getLatestRanking(post)
                  return (
                    <tr
                      key={post._id}
                      className="hover:bg-neutral-50 cursor-pointer transition-colors"
                      onClick={() => onPostClick(post)}
                    >
                      {/* 번호 */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="text-xs font-bold text-purple-700">
                          {post.monthKey && post.serialNumber !== undefined
                            ? `${post.monthKey}-${String(post.serialNumber).padStart(3, '0')}`
                            : '-'
                          }
                        </span>
                      </td>

                      {/* 등록일 */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="text-xs text-neutral-600">
                          {format(new Date(post.createdAt), 'MM-dd')}
                        </span>
                      </td>

                      {/* 작성자 */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="text-xs font-medium text-neutral-900">
                          {post.author}
                        </span>
                      </td>

                      {/* 블로그 제목 */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-neutral-900 truncate">
                            {post.title}
                          </span>
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-neutral-400 hover:text-primary flex-shrink-0"
                          >
                            <HiExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>

                      {/* 검색어 */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-bold">
                          {post.keyword}
                        </span>
                      </td>

                      {/* 검색순위 */}
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        {latestRanking ? (
                          <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-primary">
                              {latestRanking.rank}위
                            </span>
                            <span className="text-xs text-neutral-500">
                              {format(new Date(latestRanking.checkedAt), 'MM/dd')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">미기록</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
