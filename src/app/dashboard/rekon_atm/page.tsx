"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as XLSX from "xlsx";
import { id } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Upload, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const formSchema = z.object({
  atmId: z.string().min(1, "ATM harus dipilih"),
  ejFile: z.any(),
  date: z.string().min(1, "Tanggal harus diisi"),
});

interface Transaction {
  date: string;
  time: string;
  amount: number;
  denomination: number;
  quantity: number;
  type: string;
}

export default function ATMReconciliationPage() {
  const [atms, setAtms] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
      },
    },
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      atmId: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    fetchATMs();
  }, []);

  const formatIndonesianDate = (date: Date) => {
    return format(date, "dd MMMM yyyy", { locale: id });
  };

  const fetchATMs = async () => {
    try {
      console.log("Fetching ATMs...");

      const { data, error } = await supabase
        .from("atm_machines")
        .select("*")
        .order("tid", { ascending: true });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("ATMs fetched:", data);
      setAtms(data || []);
    } catch (error) {
      console.error("Error fetching ATMs:", error);
      toast.error("Gagal memuat data ATM");
    }
  };

  const parseEJFile = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split("\n");
      const transactions: Transaction[] = [];

      lines.forEach((line) => {
        // Sesuaikan dengan format EJ file masing-masing vendor
        // Ini hanya contoh parsing sederhana
        const match = line.match(/WITHDRAW|DEPOSIT/i);
        if (match) {
          const type = match[0].toUpperCase();
          const amount = parseFloat(line.match(/\d+/)?.[0] || "0");
          const denomination = amount >= 100000 ? 100000 : 50000;
          const quantity = Math.floor(amount / denomination);

          transactions.push({
            date: form.getValues("date"),
            time: new Date().toTimeString().split(" ")[0],
            amount,
            denomination,
            quantity,
            type,
          });
        }
      });

      return transactions;
    } catch (error) {
      console.error("Error parsing EJ file:", error);
      throw new Error("Format file EJ tidak valid");
    }
  };

  const calculateSummary = (transactions: Transaction[]) => {
    const summary = {
      d50k: { in: 0, out: 0 },
      d100k: { in: 0, out: 0 },
      total: { in: 0, out: 0 },
    };

    transactions.forEach((t) => {
      const type = t.type === "DEPOSIT" ? "in" : "out";
      if (t.denomination === 50000) {
        summary.d50k[type] += t.quantity;
      } else {
        summary.d100k[type] += t.quantity;
      }
      summary.total[type] += t.amount;
    });

    return summary;
  };

  const exportToExcel = () => {
    const selectedAtm = atms.find((a) => a.id === form.getValues("atmId"));

    const summaryData = [
      [
        "ATM",
        `${selectedAtm?.tid} - ${selectedAtm?.location} (${selectedAtm?.type})`,
      ],
      ["Tanggal", form.getValues("date")],
      [""],
      ["Denominasi", "Masuk", "Keluar", "Selisih"],
      [
        "50.000",
        summary.d50k.in,
        summary.d50k.out,
        summary.d50k.in - summary.d50k.out,
      ],
      [
        "100.000",
        summary.d100k.in,
        summary.d100k.out,
        summary.d100k.in - summary.d100k.out,
      ],
      [
        "Total",
        summary.total.in,
        summary.total.out,
        summary.total.in - summary.total.out,
      ],
    ];

    const transactionData = transactions.map((t) => ({
      Tanggal: t.date,
      Waktu: t.time,
      Jenis: t.type === "DEPOSIT" ? "Setor" : "Tarik",
      Denominasi: t.denomination,
      Jumlah: t.quantity,
      Total: t.amount,
    }));

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    const ws2 = XLSX.utils.json_to_sheet(transactionData);

    XLSX.utils.book_append_sheet(wb, ws1, "Ringkasan");
    XLSX.utils.book_append_sheet(wb, ws2, "Detail Transaksi");

    XLSX.writeFile(
      wb,
      `rekonsiliasi_${selectedAtm?.tid}_${form.getValues("date")}.xlsx`,
    );
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const file = (values.ejFile as FileList)[0];
      const transactions = await parseEJFile(file);
      setTransactions(transactions);

      const summary = calculateSummary(transactions);
      setSummary(summary);

      toast.success("File EJ berhasil diproses");
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Gagal memproses file EJ");
    } finally {
      setIsLoading(false);
    }
  };

  // Tambahkan fungsi untuk mendapatkan warna berdasarkan tipe ATM
  const getTypeColor = (type: string) => {
    switch (type) {
      case "NCR":
        return "bg-green-100 text-green-600";
      case "Hyosung":
        return "bg-blue-100 text-blue-600";
      case "Wincor":
        return "bg-purple-100 text-purple-600";
      case "Oki":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rekonsiliasi ATM</CardTitle>
          <CardDescription>
            Upload file EJ untuk memeriksa selisih keuangan ATM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="atmId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>ATM</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""} // Gunakan value alih-alih defaultValue
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-auto min-h-[2.5rem] py-2">
                          <SelectValue
                            placeholder="Pilih ATM"
                            className="text-base placeholder:text-muted-foreground"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        {atms && atms.length > 0 ? (
                          atms.map((atm) => (
                            <SelectItem
                              key={atm.id}
                              value={atm.id || "default"}
                              className="flex flex-col space-y-1 py-3 focus:bg-accent"
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col">
                                  <span className="font-medium text-base">
                                    {atm.tid}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {atm.location}
                                  </span>
                                </div>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                                    atm.type,
                                  )}`}
                                >
                                  {atm.type}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem
                            value="no-data"
                            className="text-center py-2 text-muted-foreground"
                          >
                            Tidak ada data ATM
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            {field.value ? (
                              formatIndonesianDate(new Date(field.value))
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(date?.toISOString().split("T")[0])
                          }
                          disabled={(date) =>
                            date > new Date() || date < new Date("2000-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ejFile"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>File EJ</FormLabel>
                    <FormControl>
                      <div className="grid w-full items-center gap-1.5">
                        <Input
                          type="file"
                          accept=".txt,.log, .jrn"
                          onChange={(e) => {
                            // Pastikan untuk memanggil onChange dengan file yang dipilih
                            if (e.target.files) {
                              onChange(e.target.files); // Hanya panggil onChange dengan files
                            }
                          }}
                          className="cursor-pointer"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Proses File
                    </>
                  )}
                </Button>

                {summary && (
                  <Button
                    type="button"
                    onClick={exportToExcel}
                    className="w-full sm:w-auto"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Excel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-4 gap-4 font-medium bg-muted p-3 rounded-lg">
                <div>Denominasi</div>
                <div>Masuk</div>
                <div>Keluar</div>
                <div>Selisih</div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-3 border rounded-lg">
                <div>50.000</div>
                <div>{summary.d50k.in.toLocaleString("id-ID")}</div>
                <div>{summary.d50k.out.toLocaleString("id-ID")}</div>
                <div
                  className={`font-medium ${
                    summary.d50k.in - summary.d50k.out === 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(summary.d50k.in - summary.d50k.out).toLocaleString("id-ID")}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-3 border rounded-lg">
                <div>100.000</div>
                <div>{summary.d100k.in.toLocaleString("id-ID")}</div>
                <div>{summary.d100k.out.toLocaleString("id-ID")}</div>
                <div
                  className={`font-medium ${
                    summary.d100k.in - summary.d100k.out === 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(summary.d100k.in - summary.d100k.out).toLocaleString(
                    "id-ID",
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 font-medium p-3 bg-muted rounded-lg mt-2">
                <div>Total</div>
                <div>{summary.total.in.toLocaleString("id-ID")}</div>
                <div>{summary.total.out.toLocaleString("id-ID")}</div>
                <div
                  className={
                    summary.total.in - summary.total.out === 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {(summary.total.in - summary.total.out).toLocaleString(
                    "id-ID",
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
