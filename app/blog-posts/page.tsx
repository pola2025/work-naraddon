'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BlogPostsList } from '@/components/blog/BlogPostsList'
import { BlogPostsStats } from '@/components/blog/BlogPostsStats'
import { CreateBlogPostModal } from '@/components/blog/CreateBlogPostModal'
import { BlogPostDetailModal } from '@/components/blog/BlogPostDetailModal'
import { BlogPost } from '@/types'

export default function BlogPostsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 월별 통계 */}
        <BlogPostsStats key={refreshKey} />

        {/* 포스팅 목록 */}
        <BlogPostsList
          key={refreshKey}
          onPostClick={post => setSelectedPost(post)}
          onCreatePost={() => setIsCreateModalOpen(true)}
        />
      </div>

      <CreateBlogPostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleRefresh}
      />

      <BlogPostDetailModal
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        post={selectedPost}
        onUpdate={handleRefresh}
      />
    </DashboardLayout>
  )
}
