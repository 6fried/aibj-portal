import { LucideIcon } from 'lucide-react'

export interface Application {
  id: string
  title: string
  description: string
  icon: LucideIcon
  href: string
  color: string
  bgColor: string
  available: boolean
  permissions?: string[] // Optionnel pour maintenir la compatibilité
}