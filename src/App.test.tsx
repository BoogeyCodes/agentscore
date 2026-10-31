import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('<App>', () => {
  it('renders the task, the three runs and a ratings matrix', () => {
    render(<App />)
    expect(screen.getByDisplayValue(/Fix the failing login test/)).toBeTruthy()
    expect(screen.getAllByText('agent-alpha').length).toBeGreaterThan(0)
    expect(screen.getByText('Correctness')).toBeTruthy()
    // alpha wins the sample; the export line names the winner in bold.
    expect(screen.getByText('agent-alpha', { selector: 'strong' })).toBeTruthy()
  })

  it('recomputes the overall when a score changes', async () => {
    render(<App />)
    const overall = () => screen.getByText('Overall (1-5)').closest('tr')!
    const before = within(overall()).getAllByText(/^[1-5]\.\d$/)[0].textContent

    const row = screen.getByText('Correctness').closest('tr')!
    const firstCellGroup = within(row).getAllByRole('group')[0]
    await userEvent.click(within(firstCellGroup).getByRole('button', { name: '1' }))

    const after = within(overall()).getAllByText(/^[1-5]\.\d$/)[0].textContent
    expect(after).not.toBe(before) // agent-alpha's overall dropped
    expect(within(overall()).getAllByText(/^[1-5]\.\d$/)).toHaveLength(3)
  })
})
