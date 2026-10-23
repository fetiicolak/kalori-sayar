import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SetupScreen } from './SetupScreen'

describe('SetupScreen', () => {
  it('explains missing Supabase configuration without exposing secrets', () => {
    render(<SetupScreen />)
    expect(screen.getByRole('heading', { name: /uygulama hazır/i })).toBeInTheDocument()
    expect(screen.getByText('.env.local')).toBeInTheDocument()
  })
})
