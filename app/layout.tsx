import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Itinera - Gestion des itinéraires techniques',
  description: 'Application de gestion des rotations et itinéraires techniques agricoles',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        {/* Dependencies for itineraire-technique component */}
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossOrigin="anonymous" />
        <link href="/css/styles-rendering.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/echarts@6.0.0/dist/echarts.js" async />
        <script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js" async />
        <script src="https://cdn.jsdelivr.net/npm/underscore@1.13.7/underscore-umd-min.js" async />
        <script src="/js/chart-render.js" async />
      </head>
      <body>{children}</body>
    </html>
  )
}
