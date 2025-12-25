'use client'

import { ProjectDetails } from '@/components/pages/ProjectDetails'
import { useRouter } from 'next/navigation'
import { use } from 'react'

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)

  const handleBack = () => {
    router.push('/')
  }

  return (
    <ProjectDetails
      projectId={resolvedParams.id}
      onBack={handleBack}
    />
  )
}
