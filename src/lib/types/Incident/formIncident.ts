import { z } from 'zod'

export const Incident = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  reported_by: z.string(),
  date_reported: z.string(),
  resolution: z.string().optional(),
})

export type Incident = z.infer<typeof Incident>
