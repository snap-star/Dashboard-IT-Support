import { z } from 'zod'

const formSchema = z.object({
  atm_id: z
    .string({
      message: 'ATM ID harus dipilih',
      error: 'ATM ID harus dipilih',
    })
    .min(1, 'ATM ID harus dipilih'),
  tahun: z
    .string({
      message: 'Tahun harus diisi',
    })
    .min(4, 'Tahun harus diisi'),
  bulan: z
    .string({
      message: 'Bulan harus dipilih',
    })
    .min(1, 'Bulan harus dipilih'),
  jumlah_transaksi: z
    .string({
      message: 'Jumlah transaksi harus diisi',
    })
    .min(1, 'Jumlah transaksi harus diisi'),
  total_nominal: z
    .string({
      message: 'Total nominal harus diisi',
    })
    .min(1, 'Total nominal harus diisi'),
  keterangan: z.string().optional(),
})

export default formSchema
