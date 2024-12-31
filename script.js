// ثوابت الأسعار والقيم
const PRICES = {
    1: 50,  // بانوراما
    2: 60,  // سلفيا
    3: 100, // حلايب
    4: 100, // جندولا
    5: 380, // بلاك بيري
    6: 450, // جلاكسي
    7: 350, // ايطالي
    8: 130  // منتج 8
};

const PRODUCT_NAMES = {
    1: "بانوراما",
    2: "سلفيا",
    3: "حلايب",
    4: "جندولا",
    5: "بلاك بيري",
    6: "جلاكسي",
    7: "ايطالي",
    8: "منتج 8"
};

// منتجات تباع بالقطعة
const UNIT_PRICES = {
    1: 80,   // فتحة غاز
    2: 100   // فتحة حوض
};

const UNIT_PRODUCT_NAMES = {
    1: "فتحة غاز",
    2: "فتحة حوض"
};

// أسعار الفرزة والحلية
const ACCESSORY_PRICES = {
    1: 10,  // فرزة
    2: 10,   // حلية
    3: 60   // حبسة مياه
};

const ACCESSORY_NAMES = {
    1: "فرزة",
    2: "حلية",
    3: "حبسة مياه"
};

const EXTRA_HEIGHT_PRICE = 20;  // سعر إضافي للأطوال فوق 200 سم
const MIN_WIDTH_PRICE = 5;      // سعر إضافي للعرض أقل من 10 سم
const MAX_HEIGHT = 200;         // الحد الأقصى للطول
const MIN_WIDTH = 10;           // الحد الأدنى للعرض

let lastCalculationResults = null;

function generateProductSelect() {
    let select = `<select class="product-select" required>
        <option value="" disabled selected>اختر نوع المنتج</option>`;
    
    for (let id in PRODUCT_NAMES) {
        select += `<option value="${id}">${PRODUCT_NAMES[id]} - ${PRICES[id]} دينار</option>`;
    }
    
    select += '</select>';
    return select;
}

function generateUnitProductSelect() {
    let select = `<select class="product-select" required>
        <option value="" disabled selected>اختر المنتج</option>`;
    
    for (let id in UNIT_PRODUCT_NAMES) {
        select += `<option value="${id}">${UNIT_PRODUCT_NAMES[id]} - ${UNIT_PRICES[id]} دينار</option>`;
    }
    
    select += '</select>';
    return select;
}

function generateAccessorySelect() {
    let select = `<select class="accessory-select">
        <option value="">بدون إضافات</option>`;
    
    for (let id in ACCESSORY_NAMES) {
        select += `<option value="${id}">${ACCESSORY_NAMES[id]} - ${ACCESSORY_PRICES[id]} دينار</option>`;
    }
    
    select += '</select>';
    return select;
}

function addNewRow() {
    const tableBody = document.querySelector('#inputTable tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="number" min="1" placeholder="العدد" class="quantity" required></td>
        <td>${generateProductSelect()}</td>
        <td><input type="number" min="1" placeholder="العرض (سم)" class="width" required></td>
        <td><input type="number" min="1" placeholder="الطول (سم)" class="height" required></td>
        <td>${generateAccessorySelect()}</td>
        <td>
            <button onclick="deleteRow(this)" class="btn-delete">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    tableBody.appendChild(row);
}

function addNewUnitRow() {
    const tableBody = document.querySelector('#unitProductsTable tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="number" min="1" placeholder="العدد" class="unit-quantity" required></td>
        <td>${generateUnitProductSelect()}</td>
        <td>
            <button onclick="deleteRow(this)" class="btn-delete">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    tableBody.appendChild(row);
}

function deleteRow(button) {
    const row = button.closest('tr');
    row.remove();
}

function validateInputs(rows, unitRows) {
    if (rows.length === 0 && unitRows.length === 0) {
        alert('يرجى إضافة منتج واحد على الأقل');
        return false;
    }

    for (const row of rows) {
        const quantity = parseFloat(row.querySelector('.quantity').value);
        const productSelect = row.querySelector('.product-select');
        const width = parseFloat(row.querySelector('.width').value);
        const height = parseFloat(row.querySelector('.height').value);

        if (!quantity || quantity < 1) {
            alert('يرجى إدخال كمية صحيحة');
            return false;
        }
        if (!productSelect.value) {
            alert('يرجى اختيار نوع المنتج لكل الصفوف');
            return false;
        }
        if (!width || width < 1) {
            alert('يرجى إدخال عرض صحيح');
            return false;
        }
        if (!height || height < 1) {
            alert('يرجى إدخال طول صحيح');
            return false;
        }
    }

    for (const row of unitRows) {
        const quantity = parseFloat(row.querySelector('.unit-quantity').value);
        const productSelect = row.querySelector('.product-select');

        if (!quantity || quantity < 1) {
            alert('يرجى إدخال كمية صحيحة للمنتجات بالقطعة');
            return false;
        }
        if (!productSelect.value) {
            alert('يرجى اختيار نوع المنتج للمنتجات بالقطعة');
            return false;
        }
    }

    return true;
}

function calculateCost() {
    const rows = document.querySelectorAll('#inputTable tbody tr');
    const unitRows = document.querySelectorAll('#unitProductsTable tbody tr');
    const customerName = document.getElementById('customerName').value;

    if (!customerName.trim()) {
        alert('يرجى إدخال اسم العميل');
        return;
    }

    if (!validateInputs(rows, unitRows)) {
        return;
    }

    let totalCost = 0;
    let countOver200 = 0;
    let totalUnder10cm = 0;
    const items = [];
    const unitItems = [];
    const productTotals = {};
    const unitProductTotals = {};
    const accessoryTotals = {
        totalLength: 0,
        byType: {}
    };

    // حساب المنتجات بالمتر المربع
    rows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.quantity').value);
        const productId = row.querySelector('.product-select').value;
        const width = parseFloat(row.querySelector('.width').value) / 100;
        const height = parseFloat(row.querySelector('.height').value) / 100;
        const accessoryId = row.querySelector('.accessory-select').value;

        const volume = quantity * width * height;
        const itemCost = volume * PRICES[productId];
        let accessoryCost = 0;

        // حساب تكلفة وأطوال الفرزة/الحلية
        if (accessoryId) {
            const totalLength = quantity * height; // الطول فقط
            accessoryCost = totalLength * ACCESSORY_PRICES[accessoryId];
            
            if (!accessoryTotals.byType[accessoryId]) {
                accessoryTotals.byType[accessoryId] = {
                    name: ACCESSORY_NAMES[accessoryId],
                    length: 0,
                    cost: 0
                };
            }
            accessoryTotals.byType[accessoryId].length += totalLength;
            accessoryTotals.byType[accessoryId].cost += accessoryCost;
            accessoryTotals.totalLength += totalLength;
        }

        totalCost += itemCost + accessoryCost;

        items.push({
            quantity,
            productId,
            productName: PRODUCT_NAMES[productId],
            width: width * 100,
            height: height * 100,
            accessoryId,
            accessoryName: accessoryId ? ACCESSORY_NAMES[accessoryId] : null,
            cost: itemCost,
            accessoryCost
        });

        if (!productTotals[productId]) {
            productTotals[productId] = {
                name: PRODUCT_NAMES[productId],
                cost: 0,
                squareMeters: 0
            };
        }
        productTotals[productId].cost += itemCost;
        productTotals[productId].squareMeters += volume;

        if (height * 100 > MAX_HEIGHT) {
            countOver200 += quantity;
        }
        if (width * 100 < MIN_WIDTH) {
            totalUnder10cm += quantity * height;
        }
    });

    // حساب المنتجات بالقطعة
    unitRows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.unit-quantity').value);
        const productId = row.querySelector('.product-select').value;
        const itemCost = quantity * UNIT_PRICES[productId];
        totalCost += itemCost;

        unitItems.push({
            quantity,
            productId,
            productName: UNIT_PRODUCT_NAMES[productId],
            cost: itemCost
        });

        if (!unitProductTotals[productId]) {
            unitProductTotals[productId] = {
                name: UNIT_PRODUCT_NAMES[productId],
                quantity: 0,
                cost: 0
            };
        }
        unitProductTotals[productId].quantity += quantity;
        unitProductTotals[productId].cost += itemCost;
    });

    const extraPrice = countOver200 * EXTRA_HEIGHT_PRICE;
    const adPrice = totalUnder10cm * MIN_WIDTH_PRICE;
    const totalPrice = totalCost + extraPrice + adPrice;

    lastCalculationResults = {
        customerName,
        customerPhone: document.getElementById('customerPhone').value,
        items,
        unitItems,
        productTotals,
        unitProductTotals,
        accessoryTotals,
        totalCost,
        countOver200,
        extraPrice,
        totalUnder10cm,
        adPrice,
        totalPrice
    };

    displayResults(lastCalculationResults);
}

function displayResults(results) {
    // جدول المنتجات بالمتر المربع
    let productTable = results.items.length > 0 ? `
        <h4>المنتجات بالمتر المربع</h4>
        <table class="results-table">
            <thead>
                <tr>
                    <th>المنتج</th>
                    <th>العدد</th>
                    <th>العرض</th>
                    <th>الطول</th>
                    <th>المتر المربع</th>
                    <th>سعر المتر</th>
                    <th>السعر الإجمالي</th>
                </tr>
            </thead>
            <tbody>
                ${results.items.map(item => {
                    const squareMeters = (item.width * item.height * item.quantity) / 10000;
                    const pricePerMeter = PRICES[item.productId];
                    return `
                        <tr>
                            <td>${item.productName}</td>
                            <td>${item.quantity}</td>
                            <td>${item.width.toFixed(1)} سم</td>
                            <td>${item.height.toFixed(1)} سم</td>
                            <td>${squareMeters.toFixed(2)} م²</td>
                            <td>${pricePerMeter} دينار</td>
                            <td>${item.cost.toFixed(2)} دينار</td>
                        </tr>
                    `;
                }).join('')}
                <tr class="total-row">
                    <td colspan="4">المجموع</td>
                    <td>${Object.values(results.productTotals).reduce((sum, product) => sum + product.squareMeters, 0).toFixed(2)} م²</td>
                    <td></td>
                    <td>${Object.values(results.productTotals).reduce((sum, product) => sum + product.cost, 0).toFixed(2)} دينار</td>
                </tr>
            </tbody>
        </table>
    ` : '';

    // جدول المنتجات بالقطعة
    let unitTable = results.unitItems.length > 0 ? `
        <h4>المصنعيات</h4>
        <table class="results-table">
            <thead>
                <tr>
                    <th>المنتج</th>
                    <th>العدد</th>
                    <th>سعر القطعة</th>
                    <th>السعر الإجمالي</th>
                </tr>
            </thead>
            <tbody>
                ${results.unitItems.map(item => `
                    <tr>
                        <td>${item.productName}</td>
                        <td>${item.quantity}</td>
                        <td>${UNIT_PRICES[item.productId]} دينار</td>
                        <td>${item.cost.toFixed(2)} دينار</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td colspan="2">المجموع</td>
                    <td></td>
                    <td>${Object.values(results.unitProductTotals).reduce((sum, product) => sum + product.cost, 0).toFixed(2)} دينار</td>
                </tr>
            </tbody>
        </table>
    ` : '';

    // جدول الفرزة والحلية
    let accessoryTable = Object.keys(results.accessoryTotals.byType).length > 0 ? `
        <h4>الفرزة والحلية</h4>
        <table class="results-table">
            <thead>
                <tr>
                    <th>النوع</th>
                    <th>الطول الكلي</th>
                    <th>سعر المتر</th>
                    <th>السعر الإجمالي</th>
                </tr>
            </thead>
            <tbody>
                ${Object.values(results.accessoryTotals.byType).map(accessory => `
                    <tr>
                        <td>${accessory.name}</td>
                        <td>${accessory.length.toFixed(2)} متر</td>
                        <td>${ACCESSORY_PRICES[Object.keys(ACCESSORY_NAMES).find(key => ACCESSORY_NAMES[key] === accessory.name)]} دينار</td>
                        <td>${accessory.cost.toFixed(2)} دينار</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td colspan="2">المجموع</td>
                    <td></td>
                    <td>${Object.values(results.accessoryTotals.byType).reduce((sum, accessory) => sum + accessory.cost, 0).toFixed(2)} دينار</td>
                </tr>
            </tbody>
        </table>
    ` : '';

    // الإضافات والسعر النهائي
    let extrasAndTotal = `
        <div class="extras-container">
            ${results.countOver200 > 0 ? `
                <div class="extra-item">
                    <span>عدد الأطوال فوق ${MAX_HEIGHT} سم:</span>
                    <span>${results.countOver200}</span>
                    <span>السعر الإضافي: ${results.extraPrice.toFixed(2)} دينار</span>
                </div>
            ` : ''}
            ${results.totalUnder10cm > 0 ? `
                <div class="extra-item">
                    <span>الطول أقل من ${MIN_WIDTH} سم:</span>
                    <span>${results.totalUnder10cm.toFixed(2)}</span>
                    <span>السعر الإضافي: ${results.adPrice.toFixed(2)} دينار</span>
                </div>
            ` : ''}
            <div class="total-price">
                السعر الإجمالي النهائي: ${results.totalPrice.toFixed(2)} دينار
            </div>
        </div>
    `;

    document.getElementById('result').innerHTML = `
        ${productTable}
        ${unitTable}
        ${accessoryTable}
        ${extrasAndTotal}
    `;
}

function previewInvoice() {
    if (!lastCalculationResults) {
        alert('يرجى حساب التكلفة أولاً');
        return;
    }

    const r = lastCalculationResults;
    const currentDate = new Date().toLocaleDateString('ar-EG');
    const invoiceNumber = generateInvoiceNumber();

    // تحديث معلومات الفاتورة
    document.getElementById('invoiceDate').textContent = currentDate;
    document.getElementById('invoiceNumber').textContent = invoiceNumber;
    document.getElementById('invoiceCustomerName').textContent = r.customerName;
    document.getElementById('invoiceCustomerPhone').textContent = r.customerPhone || 'غير متوفر';

    // جدول المنتجات بالمتر المربع
    const itemsTable = r.items.length > 0 ? `
        <h4>المنتجات بالمتر المربع</h4>
        <table class="invoice-table">
            <thead>
                <tr>
                    <th>المنتج</th>
                    <th>العدد</th>
                    <th>العرض (سم)</th>
                    <th>الطول (سم)</th>
                    <th>المتر المربع</th>
                    <th>سعر المتر</th>
                    <th>السعر الإجمالي</th>
                </tr>
            </thead>
            <tbody>
                ${r.items.map(item => {
                    const squareMeters = (item.width * item.height * item.quantity) / 10000;
                    const pricePerMeter = PRICES[item.productId];
                    return `
                        <tr>
                            <td>${item.productName}</td>
                            <td>${item.quantity}</td>
                            <td>${item.width.toFixed(1)}</td>
                            <td>${item.height.toFixed(1)}</td>
                            <td>${squareMeters.toFixed(2)}</td>
                            <td>${pricePerMeter}</td>
                            <td>${item.cost.toFixed(2)}</td>
                        </tr>
                    `;
                }).join('')}
                <tr class="total-row">
                    <td colspan="4">المجموع</td>
                    <td>${Object.values(r.productTotals).reduce((sum, product) => sum + product.squareMeters, 0).toFixed(2)}</td>
                    <td></td>
                    <td>${Object.values(r.productTotals).reduce((sum, product) => sum + product.cost, 0).toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
    ` : '';

    // جدول المصنعيات
    const unitTable = r.unitItems.length > 0 ? `
        <h4>المصنعيات</h4>
        <table class="invoice-table">
            <thead>
                <tr>
                    <th>المنتج</th>
                    <th>العدد</th>
                    <th>سعر القطعة</th>
                    <th>السعر الإجمالي</th>
                </tr>
            </thead>
            <tbody>
                ${r.unitItems.map(item => `
                    <tr>
                        <td>${item.productName}</td>
                        <td>${item.quantity}</td>
                        <td>${UNIT_PRICES[item.productId]}</td>
                        <td>${item.cost.toFixed(2)}</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td colspan="3">المجموع</td>
                    <td>${Object.values(r.unitProductTotals).reduce((sum, product) => sum + product.cost, 0).toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
    ` : '';

    // جدول الفرزة والحلية
    const accessoryTable = Object.keys(r.accessoryTotals.byType).length > 0 ? `
        <h4>الفرزة والحلية</h4>
        <table class="invoice-table">
            <thead>
                <tr>
                    <th>النوع</th>
                    <th>الطول الكلي (متر)</th>
                    <th>سعر المتر</th>
                    <th>السعر الإجمالي</th>
                </tr>
            </thead>
            <tbody>
                ${Object.values(r.accessoryTotals.byType).map(accessory => `
                    <tr>
                        <td>${accessory.name}</td>
                        <td>${accessory.length.toFixed(2)}</td>
                        <td>${ACCESSORY_PRICES[Object.keys(ACCESSORY_NAMES).find(key => ACCESSORY_NAMES[key] === accessory.name)]}</td>
                        <td>${accessory.cost.toFixed(2)}</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td colspan="3">المجموع</td>
                    <td>${Object.values(r.accessoryTotals.byType).reduce((sum, accessory) => sum + accessory.cost, 0).toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
    ` : '';

    // جدول الإضافات والسعر النهائي
    const extrasAndTotal = `
        <table class="invoice-table">
            <tbody>
                ${r.countOver200 > 0 ? `
                    <tr>
                        <td>عدد الأطوال فوق ${MAX_HEIGHT} سم</td>
                        <td>${r.countOver200}</td>
                        <td>السعر الإضافي</td>
                        <td>${r.extraPrice.toFixed(2)}</td>
                    </tr>
                ` : ''}
                ${r.totalUnder10cm > 0 ? `
                    <tr>
                        <td>الطول أقل من ${MIN_WIDTH} سم</td>
                        <td>${r.totalUnder10cm.toFixed(2)}</td>
                        <td>السعر الإضافي</td>
                        <td>${r.adPrice.toFixed(2)}</td>
                    </tr>
                ` : ''}
                <tr class="grand-total-row">
                    <td colspan="3">السعر الإجمالي النهائي</td>
                    <td>${r.totalPrice.toFixed(2)} دينار</td>
                </tr>
            </tbody>
        </table>
    `;

    document.getElementById('invoiceItems').innerHTML = itemsTable + unitTable + accessoryTable;
    document.getElementById('invoiceResults').innerHTML = extrasAndTotal;

    document.getElementById('invoice').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function updateInvoiceItem(index, field, value) {
    if (lastCalculationResults && lastCalculationResults.items[index]) {
        lastCalculationResults.items[index][field] = field === 'quantity' || field === 'width' || field === 'height' ? parseFloat(value) : value;
    }
}

function updateUnitInvoiceItem(index, field, value) {
    if (lastCalculationResults && lastCalculationResults.unitItems[index]) {
        lastCalculationResults.unitItems[index][field] = field === 'quantity' ? parseFloat(value) : value;
    }
}

function printInvoice() {
    const inputs = document.querySelectorAll('.invoice-input');
    inputs.forEach(input => {
        const span = document.createElement('span');
        span.textContent = input.value;
        input.parentNode.replaceChild(span, input);
    });

    window.print();
}

function closeInvoice() {
    document.getElementById('invoice').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
}