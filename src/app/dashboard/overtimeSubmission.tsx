import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type React from 'react'
import { useState } from 'react'

interface OvertimeDate {
  tanggal: string
}

interface FormEntry {
  nip: string
  nama: string
  jabatan: string
  rekening: string
  keterangan: string
  alasan: string
  unitBagian: string
  tanggals: OvertimeDate[]
  penyelia: string
  jabatanPenyelia: string
}

const OvertimeSubmission: React.FC = () => {
  const [entries, setEntries] = useState<FormEntry[]>([
    {
      nip: '',
      nama: '',
      jabatan: '',
      rekening: '',
      keterangan: '',
      alasan: '',
      unitBagian: '',
      tanggals: [{ tanggal: '' }],
      penyelia: '',
      jabatanPenyelia: '',
    },
  ])

  const handleChange = (entryIndex: number, field: keyof FormEntry, value: string) => {
    const newEntries = [...entries]
    // @ts-expect-error
    newEntries[entryIndex][field] = value
    setEntries(newEntries)
  }

  const handleDateChange = (entryIndex: number, dateIndex: number, value: string) => {
    const newEntries = [...entries]
    newEntries[entryIndex].tanggals[dateIndex].tanggal = value
    setEntries(newEntries)
  }

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        nip: '',
        nama: '',
        jabatan: '',
        rekening: '',
        keterangan: '',
        alasan: '',
        unitBagian: '',
        tanggals: [{ tanggal: '' }],
        penyelia: '',
        jabatanPenyelia: '',
      },
    ])
  }

  const removeEntry = (entryIndex: number) => {
    const newEntries = [...entries]
    newEntries.splice(entryIndex, 1)
    setEntries(newEntries)
  }

  const addDate = (entryIndex: number) => {
    const newEntries = [...entries]
    newEntries[entryIndex].tanggals.push({ tanggal: '' })
    setEntries(newEntries)
  }

  const removeDate = (entryIndex: number, dateIndex: number) => {
    const newEntries = [...entries]
    newEntries[entryIndex].tanggals.splice(dateIndex, 1)
    setEntries(newEntries)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simpan data ke backend atau state global
    console.log(entries)
    alert('Pengajuan lembur berhasil dikirim!')
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
    return new Date(dateString).toLocaleDateString('id-ID', options)
  }

  // Fungsi untuk mengelompokkan entri berdasarkan data yang sama
  const groupEntries = () => {
    const grouped: {
      key: string
      dates: string[]
      data: FormEntry
    }[] = []

    entries.forEach(entry => {
      const key = `${entry.nama}|${entry.nip}|${entry.jabatan}|${entry.rekening}|${entry.keterangan}|${entry.alasan}|${entry.unitBagian}`
      const existingGroup = grouped.find(group => group.key === key)

      if (existingGroup) {
        // Tambahkan tanggal baru ke grup yang ada
        entry.tanggals.forEach(date => {
          if (!existingGroup.dates.includes(date.tanggal)) {
            existingGroup.dates.push(date.tanggal)
          }
        })
      } else {
        // Buat grup baru
        grouped.push({
          key,
          dates: entry.tanggals.map(date => date.tanggal),
          data: entry,
        })
      }
    })

    // Urutkan tanggal dalam setiap grup
    grouped.forEach(group => {
      group.dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    })

    return grouped
  }

  const saveAsPDF = () => {
    const doc = new jsPDF()
    doc.text('Nota Lembur', 14, 20)

    // Header data untuk tabel
    const headers = ['Tanggal', 'Nama', 'NIP', 'Jabatan', 'Rekening', 'Keterangan']

    // Persiapkan data untuk tabel
    const tableData: any[] = []
    const groupedEntries = groupEntries()

    groupedEntries.forEach(group => {
      const { dates, data } = group

      dates.forEach((date, index) => {
        const row = [
          formatDate(date),
          index === 0 ? data.nama : '',
          index === 0 ? data.nip : '',
          index === 0 ? data.jabatan : '',
          index === 0 ? data.rekening : '',
          index === 0 ? data.keterangan : '',
        ]
        tableData.push(row)
      })
    })

    // Konfigurasi untuk merge cells
    const didParseCell = (data: any) => {
      const row = data.row.index
      const col = data.column.index

      if (col > 0 && tableData[row][col] === '') {
        data.cell.styles.fillColor = [255, 255, 255]
      }
    }

    // Buat tabel dengan autoTable
    autoTable(doc, {
      startY: 30,
      head: [headers],
      body: tableData,
      didParseCell,
      // Tambahkan opsi untuk menggabungkan sel yang kosong
      columnStyles: {
        0: { cellWidth: 30 }, // Tanggal
        1: { cellWidth: 30 }, // Nama
        2: { cellWidth: 25 }, // NIP
        3: { cellWidth: 25 }, // Jabatan
        4: { cellWidth: 25 }, // Rekening
        5: { cellWidth: 25 }, // Keterangan
      },
    })

    // Tambahkan tanda tangan dan disposisi
    const finalY = (doc as any).lastAutoTable.finalY || 150
    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    // Tanda tangan penyelia
    doc.text(`Ponorogo, ${currentDate}`, 120, finalY + 20)
    doc.text(`${entries[0].penyelia}`, 140, finalY + 65)
    doc.text(`Penyelia ${entries[0].unitBagian}`, 130, finalY + 70)

    // Disposisi
    doc.text('Disposisi Pimpinan:', 14, finalY + 90)
    doc.rect(14, finalY + 95, 180, 40) // Kotak disposisi

    doc.save('nota_lembur.pdf')
  }

  const printNota = () => {
    const groupedEntries = groupEntries()
    let tableRows = ''

    groupedEntries.forEach(group => {
      const { dates, data } = group
      const rowCount = dates.length

      dates.forEach((date, index) => {
        tableRows += `<tr>
          <td>${formatDate(date)}</td>
          ${index === 0 ? `<td rowspan="${rowCount}">${data.nama}</td>` : ''}
          ${index === 0 ? `<td rowspan="${rowCount}">${data.nip}</td>` : ''}
          ${index === 0 ? `<td rowspan="${rowCount}">${data.jabatan}</td>` : ''}
          ${index === 0 ? `<td rowspan="${rowCount}">${data.rekening}</td>` : ''}
          ${index === 0 ? `<td rowspan="${rowCount}">${data.keterangan}</td>` : ''}
        </tr>`
      })
    })

    const currentDate = new Date()
    const formattedDate = currentDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const printWindow = window.open('', 'PRINT', 'height=842,width=595')
    printWindow?.document.write(`
      <html>
        <head>
          <title>Nota Lembur</title>
          <style>
          @page { size: A4; margin: 20mm; }
          body { 
            font-family: 'Times New Roman', Times, serif; 
            font-size: 12pt; 
            margin: 0;
            padding: 0;
          }
          h1 { 
            text-align: center; 
          }
          p { 
            text-align: justify; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
          }
          th { 
            border: 1px solid #000; 
            padding: 8px; 
            text-align: center; 
          }
          th { 
            background-color: #f2f2f2; 
          }
          td { 
            border: 1px solid #000; 
            padding: 8px; 
            text-align: left; 
          }
          .signatures {
            margin-top: 30px;
            width: 100%;
          }
          .signature-section {
            float: right;
            width: 250px;
            text-align: center;
          }
          .signature-box {
            text-align: center;
            margin-top: 20px;
          }
          .signature-line {
            border-bottom: 1px solid #000;
            width: 200px;
            margin: 50px auto 0;
          }
          .signature-name {
            margin: 5px 0 0;
          }
          .signature-title {
            margin: 5px 0 0;
          }
          .disposition-section {
            margin-top: 50px;
            clear: both;
            padding-top: 20px;
          }
          .disposition-box {
            border: 1px solid #000;
            padding: 15px;
            margin-top: 10px;
            min-height: 100px;
          }
          .clearfix::after {
            content: "";
            clear: both;
            display: table;
          }
        </style>
        </head>
        <body>
          <h1>Nota Lembur</h1>
          <p>Kepada : Pemimpin Cabang Ponorogo</p>
          <p>Dari : Unit ${entries[0].unitBagian}</p>
          <hr>
          <p>Sehubungan dengan adanya ${entries[0].alasan}, kami dari Unit Bagian ${entries[0].unitBagian} 
          mengajukan permohonan lembur dengan rincian sebagai berikut :</p>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Nama</th>
                <th>NIP</th>
                <th>Jabatan</th>
                <th>Rekening</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="signatures clearfix">
          <div class="signature-section">
            <p>Ponorogo, ${formattedDate}</p>
            <p>Mengetahui</p>
            <div class="signature-box">
            <br/>
            <br/>
            <br/>
            <p class="signature-title"><strong><u>${entries[0].penyelia}</u></strong></p>
            <p class="signature-title">${entries[0].jabatanPenyelia}</p>
            </div>
          </div>
        </div>

        <div class="disposition-section">
          <p><strong>Disposisi Pimpinan:</strong></p>
          <div class="disposition-box"></div>
        </div>
        </body>
      </html>
    `)
    printWindow?.document.close()
    printWindow?.print()
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Pengajuan Lembur</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {entries.map((entry, entryIndex) => (
          <div key={entryIndex} className="border p-4 rounded mb-4">
            <h3 className="text-xl font-semibold mb-2">Anggota {entryIndex + 1}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block">Nama</label>
                <input
                  type="text"
                  name="nama"
                  placeholder="Nama"
                  value={entry.nama}
                  onChange={e => handleChange(entryIndex, 'nama', e.target.value)}
                  required
                  className="w-full border px-3 py-2"
                />
              </div>
              <div>
                <label className="block">NIP</label>
                <input
                  type="text"
                  name="nip"
                  placeholder="NIP"
                  value={entry.nip}
                  onChange={e => handleChange(entryIndex, 'nip', e.target.value)}
                  required
                  className="w-full border px-3 py-2"
                />
              </div>
              <div>
                <label className="block">Jabatan</label>
                <input
                  type="text"
                  name="jabatan"
                  placeholder="Jabatan"
                  value={entry.jabatan}
                  onChange={e => handleChange(entryIndex, 'jabatan', e.target.value)}
                  required
                  className="w-full border px-3 py-2"
                />
              </div>
              <div>
                <label className="block">Nomor Rekening</label>
                <input
                  type="text"
                  name="rekening"
                  placeholder="Nomor Rekening"
                  value={entry.rekening}
                  onChange={e => handleChange(entryIndex, 'rekening', e.target.value)}
                  required
                  className="w-full border px-3 py-2"
                />
              </div>
              <div>
                <label className="block">Keterangan</label>
                <textarea
                  name="keterangan"
                  placeholder="Keterangan"
                  value={entry.keterangan}
                  onChange={e => handleChange(entryIndex, 'keterangan', e.target.value)}
                  required
                  className="w-full border px-3 py-2"
                />
              </div>
              <div>
                <label className="block">Alasan</label>
                <input
                  type="text"
                  name="alasan"
                  placeholder="Alasan"
                  value={entry.alasan}
                  onChange={e => handleChange(entryIndex, 'alasan', e.target.value)}
                  required
                  className="w-full border px-3 py-2"
                />
              </div>
              <div>
                <label className="block">Unit Bagian</label>
                <input
                  type="text"
                  name="unitBagian"
                  placeholder="Unit Bagian"
                  value={entry.unitBagian}
                  onChange={e => handleChange(entryIndex, 'unitBagian', e.target.value)}
                  required
                  className="w-full border px-3 py-2"
                />
              </div>
              <div>
                <label className="block">Penyelia</label>
                <input
                  type="text"
                  name="penyelia"
                  placeholder="Penyelia"
                  value={entry.penyelia}
                  onChange={e => handleChange(entryIndex, 'penyelia', e.target.value)}
                  required
                  className="w-full border px-3 py-2"
                />
              </div>
              <div>
                <label className="block">Jabatan Penyelia</label>
                <input
                  type="text"
                  name="jabatanPenyelia"
                  placeholder="Jabatan Penyelia"
                  value={entry.jabatanPenyelia}
                  onChange={e => handleChange(entryIndex, 'jabatanPenyelia', e.target.value)}
                  required
                  className="w-full border px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Tanggal Lembur</h4>
              {entry.tanggals.map((date, dateIndex) => (
                <div key={dateIndex} className="flex items-center mb-2">
                  <input
                    type="date"
                    placeholder="Tanggal"
                    value={date.tanggal}
                    onChange={e => handleDateChange(entryIndex, dateIndex, e.target.value)}
                    required
                    className="w-full border px-3 py-2"
                  />
                  {entry.tanggals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDate(entryIndex, dateIndex)}
                      className="ml-2 bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addDate(entryIndex)}
                className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded"
              >
                Tambah Tanggal
              </button>
            </div>
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(entryIndex)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              >
                Hapus Anggota
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addEntry}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Tambah Anggota
        </button>
        <div className="flex space-x-4 mt-4">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Kirim
          </button>
          <button
            type="button"
            onClick={saveAsPDF}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Simpan sebagai PDF
          </button>
          <button
            type="button"
            onClick={printNota}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cetak Nota
          </button>
        </div>
      </form>
    </div>
  )
}

export default OvertimeSubmission
