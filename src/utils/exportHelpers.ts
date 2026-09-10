import * as XLSX from 'xlsx';
import { WholesaleItem, Language } from '../types';

export function exportWholesaleExcel(items: WholesaleItem[], language: Language) {
  const isUrdu = language === 'ur';

  const dataForExport = items.map((item, idx) => ({
    [isUrdu ? "نمبر" : "No."]: idx + 1,
    [isUrdu ? "نام آئٹم" : "Item Name"]: item.name,
    [isUrdu ? "کیٹیگری" : "Category"]: item.cat,
    [isUrdu ? "بنیادی ریٹ (PKR)" : "Base Rate (PKR)"]: Number(item.rate) || 0,
    [isUrdu ? "موجودہ اسٹاک" : "Current Stock"]: item.stock,
    [isUrdu ? "ڈیمانڈ مع اسٹار (*)" : "Demand (*)"]: Number(item.demand) > 0 ? `*${item.demand}` : "—",
    [isUrdu ? "متوقع لاگت (PKR)" : "Projected Cost (PKR)"]: (Number(item.demand) || 0) * (Number(item.rate) || 0),
    [isUrdu ? "کیفیت / اسٹیٹس" : "Status / Remarks"]: item.status || ""
  }));

  let totalDemandUnits = 0;
  let totalProjectedCost = 0;
  let totalDemandCount = 0;

  items.forEach(i => {
    const d = Number(i.demand) || 0;
    const r = Number(i.rate) || 0;
    if (d > 0) {
      totalDemandCount++;
      totalDemandUnits += d;
      totalProjectedCost += (d * r);
    }
  });

  dataForExport.push({
    [isUrdu ? "نمبر" : "No."]: isUrdu ? "میزان کل" : "Total",
    [isUrdu ? "نام آئٹم" : "Item Name"]: "Grand Total",
    [isUrdu ? "کیٹیگری" : "Category"]: "—",
    [isUrdu ? "بنیادی ریٹ (PKR)" : "Base Rate (PKR)"]: "—" as any,
    [isUrdu ? "موجودہ اسٹاک" : "Current Stock"]: "—",
    [isUrdu ? "ڈیمانڈ مع اسٹار (*)" : "Demand (*)"]: `*${totalDemandUnits} ${isUrdu ? 'پیس' : 'pcs'}`,
    [isUrdu ? "متوقع لاگت (PKR)" : "Projected Cost (PKR)"]: Math.round(totalProjectedCost),
    [isUrdu ? "کیفیت / اسٹیٹس" : "Status / Remarks"]: `${totalDemandCount} ${isUrdu ? 'ترجیحی اشیاء' : 'Priority items'}`
  });

  const worksheet = XLSX.utils.json_to_sheet(dataForExport);
  worksheet['!views'] = [{ rightToLeft: isUrdu }];
  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 24 },
    { wch: 15 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 30 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, isUrdu ? "ریٹ و ڈیمانڈ لسٹ" : "Demand Sheet");
  XLSX.writeFile(workbook, "OrderLA_Master_Rate_and_Demand_Sheet.xlsx");
}

export function generateWhatsAppOrderText(items: WholesaleItem[], language: Language): string {
  const isUrdu = language === 'ur';

  let waText = `🚚 *OrderLa Wholesale BOS* — *${isUrdu ? 'مشترکہ ڈیمانڈ و خریداری لسٹ' : 'Procurement & Demand Sheet'}*\n\n`;

  // Section 1: Shalmi Market
  const shalmiItems = items.filter(i => i.cat === 'شالمی');
  if (shalmiItems.length > 0) {
    waText += `*${isUrdu ? 'حصہ اول: شالمی مارکیٹ' : 'Part 1: Shalmi Wholesale'}*\n`;
    shalmiItems.forEach((item, i) => {
      const d = Number(item.demand) || 0;
      const demandStr = d > 0 ? ` (*${d})` : ``;
      waText += `${i + 1}۔ ${item.name}${demandStr} — Rs ${item.rate}\n`;
    });
    waText += `\n`;
  }

  // Section 2: Kashif Wholesale
  const kashifItems = items.filter(i => i.cat === 'کاشف صاحب');
  if (kashifItems.length > 0) {
    waText += `*${isUrdu ? 'حصہ دوم: کاشف صاحب والی لسٹ' : 'Part 2: Kashif Wholesale'}*\n`;
    kashifItems.forEach((item, i) => {
      const d = Number(item.demand) || 0;
      const demandStr = d > 0 ? ` (*${d})` : ``;
      waText += `${shalmiItems.length + i + 1}۔ ${item.name}${demandStr} — Rs ${item.rate}\n`;
    });
    waText += `\n`;
  }

  // Section 3: Others / Custom Items
  const otherItems = items.filter(i => i.cat !== 'شالمی' && i.cat !== 'کاشف صاحب');
  if (otherItems.length > 0) {
    waText += `*${isUrdu ? 'حصہ سوم: دیگر کسٹم آئٹمز' : 'Part 3: Custom Items'}*\n`;
    otherItems.forEach((item, i) => {
      const d = Number(item.demand) || 0;
      const demandStr = d > 0 ? ` (*${d})` : ``;
      waText += `${i + 1}۔ ${item.name}${demandStr} — Rs ${item.rate}\n`;
    });
    waText += `\n`;
  }

  // Summary Totals
  let totalUnits = 0;
  let totalBudget = 0;
  let demandedCount = 0;
  items.forEach(i => {
    const d = Number(i.demand) || 0;
    const r = Number(i.rate) || 0;
    if (d > 0) {
      demandedCount++;
      totalUnits += d;
      totalBudget += (d * r);
    }
  });

  waText += `------------------------------------\n`;
  waText += `*${isUrdu ? 'مجموعی خلاصہ برائے خریداری:' : 'Procurement Summary:'}*\n`;
  waText += `• ${isUrdu ? 'کل ترجیحی اشیاء' : 'Priority items count'}: ${demandedCount}\n`;
  waText += `• ${isUrdu ? 'کل درکار تعداد' : 'Total required units'}: ${totalUnits} ${isUrdu ? 'پیس' : 'pcs'}\n`;
  waText += `• ${isUrdu ? 'متوقع خریداری بجٹ' : 'Projected budget'}: Rs ${Math.round(totalBudget).toLocaleString()} PKR\n`;

  return waText;
}
