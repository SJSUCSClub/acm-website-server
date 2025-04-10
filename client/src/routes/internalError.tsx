import { createFileRoute } from '@tanstack/react-router'
import InternalError from '../pages/InternalError'

export const Route = createFileRoute('/internalError')({
  component: InternalError,
})
