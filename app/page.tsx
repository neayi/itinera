'use client'

import { ItineraryList as ItineraryListComponent } from '@/components/pages/ItineraryList'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const handleNavigateToProject = (id: string) => {
    router.push(`/project/${id}`)
  }

  const handleNavigateToWizard = () => {
    router.push('/wizard')
  }

  return (
    <ItineraryListComponent
      onNavigateToProject={handleNavigateToProject}
      onNavigateToWizard={handleNavigateToWizard}
    />
  )
}
