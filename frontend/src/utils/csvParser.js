/**
 * CSV File Parsing & Format Validation Utility
 */
export const parseCSV = (csvText) => {
  const lines = csvText.split(/\r\n|\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) {
    return { validRecords: [], errors: ['CSV file is empty.'] };
  }

  // Helper to split CSV row handling quotes
  const parseRow = (text) => {
    const arr = [];
    let quote = false;
    let col = '';
    for (let i = 0; i < text.length; i++) {
      const cc = text[i];
      if (cc === '"') {
        quote = !quote;
      } else if (cc === ',' && !quote) {
        arr.push(col.trim().replace(/^"|"$/g, ''));
        col = '';
      } else {
        col += cc;
      }
    }
    arr.push(col.trim().replace(/^"|"$/g, ''));
    return arr;
  };

  const headers = parseRow(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const validRecords = [];
  const errors = [];

  // Standard Header Index Mapping
  const findIndex = (keys) => headers.findIndex((h) => keys.some((k) => h.includes(k)));

  const idxProduct = findIndex(['product', 'name', 'item', 'title']);
  const idxCategory = findIndex(['category', 'type']);
  const idxQty = findIndex(['quantity', 'qty', 'stock', 'count']);
  const idxUnit = findIndex(['unit']);
  const idxExpiry = findIndex(['expiry', 'expiration', 'expire']);
  const idxSupplier = findIndex(['supplier', 'vendor']);
  const idxStorage = findIndex(['storage', 'condition']);

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    if (row.length === 0 || row.every((c) => c === '')) continue;

    const rowNum = i + 1;
    const productName = idxProduct >= 0 ? row[idxProduct] : row[0];
    const categoryName = idxCategory >= 0 ? row[idxCategory] : 'General';
    const rawQty = idxQty >= 0 ? row[idxQty] : row[1];
    const quantity = parseFloat(rawQty);
    const unit = idxUnit >= 0 ? row[idxUnit] : 'kg';
    const expiryDate = idxExpiry >= 0 ? row[idxExpiry] : row[2];
    const supplierName = idxSupplier >= 0 ? row[idxSupplier] : 'Vendor Supplier';
    const storageCondition = idxStorage >= 0 ? row[idxStorage] : 'Ambient';

    // Row Validation Rules
    if (!productName) {
      errors.push(`Line ${rowNum}: Missing product name.`);
      continue;
    }

    if (isNaN(quantity) || quantity <= 0) {
      errors.push(`Line ${rowNum}: Invalid quantity "${rawQty}". Must be a positive number.`);
      continue;
    }

    if (!expiryDate) {
      errors.push(`Line ${rowNum}: Missing expiry date.`);
      continue;
    }

    validRecords.push({
      productName,
      categoryName: categoryName || 'General',
      quantity,
      unit: unit || 'kg',
      expiryDate: new Date(expiryDate).isValid ? new Date(expiryDate).toISOString() : expiryDate,
      supplierName: supplierName || 'Vendor Supplier',
      storageCondition: storageCondition || 'Ambient',
      batchNumber: `CSV-${Math.floor(Math.random() * 900000 + 100000)}`,
    });
  }

  return { validRecords, errors };
};
