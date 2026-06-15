import { z } from 'zod'

const TransaksiATM = z.object({
  id: z.string(),
  atm_id: z.string(),
  tahun: z.number(),
  bulan: z.string(),
  jumlah_transaksi: z.number(),
  total_nominal: z.number(),
  rata_rata_harian: z.number(),
  keterangan: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export default TransaksiATM
