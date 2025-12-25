'use client'

import { CreateItineraryWizard } from '@/components/pages/CreateItineraryWizard'
import { useRouter } from 'next/navigation'

export default function WizardPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push('/')
  }

  const handleComplete = (projectId: string) => {
    router.push(`/project/${projectId}`)
  }

  return (
    <CreateItineraryWizard
      onBack={handleBack}
      onComplete={handleComplete}
    />
  )
}
