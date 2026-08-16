const fs = require('fs');

let jsxPath = 'frontend/src/pages/Customer/History.jsx';
let cssPath = 'frontend/src/pages/Customer/History.css';

let jsxContent = fs.readFileSync(jsxPath, 'utf8');
let cssContent = fs.readFileSync(cssPath, 'utf8');

// Update JSX - fetchOrders
jsxContent = jsxContent.replace(
  /const formattedOrders = data\.orders\.map\(order => \{[\s\S]*?return \{[\s\S]*?pesanan: order\.order_details \/\/ Pass the details for the status page\s*\};\s*\}\);/m,
  `const formattedOrders = data.orders.map(order => {
            const isCanceled = order.status === 'batal';
            const ratingData = savedRatings[order.id];
            
            const dateObj = new Date(order.created_at);
            const now = new Date();
            const isToday = dateObj.getDate() === now.getDate() && dateObj.getMonth() === now.getMonth() && dateObj.getFullYear() === now.getFullYear();
            
            const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
            
            let dateStr = '';
            if (isToday) {
              dateStr = \`Hari ini, \${timeStr}\`;
            } else {
              const dayStr = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
              const dateMonthStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
              dateStr = \`\${dayStr}, \${dateMonthStr}, \${timeStr}\`;
            }

            const monthYearGroup = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

            let displayStatus = order.status.charAt(0).toUpperCase() + order.status.slice(1);
            if (order.status === 'selesai') displayStatus = 'Sukses';
            if (isCanceled) displayStatus = 'Dibatalkan';

            return {
              id: order.id,
              service: order.service?.name || 'Layanan',
              status: displayStatus,
              date: dateStr,
              monthYearGroup: monthYearGroup,
              ratingValue: ratingData ? ratingData.rating : null,
              isCanceled: isCanceled,
              statusColor: isCanceled ? '#64748b' : '#1e293b',
              pesanan: order.order_details // Pass the details for the status page
            };
          });`
);

// Update JSX - getServiceIcon
jsxContent = jsxContent.replace(
  /const getServiceIcon = \(serviceName\) => \{[\s\S]*?return <ShoppingBag size=\{20\} color="#ffffff" \/>;\s*\};/m,
  `const getServiceIcon = (serviceName) => {
    if (serviceName.toLowerCase().includes('belanja')) return <ShoppingBag size={24} color="#034078" />;
    if (serviceName.toLowerCase().includes('antar')) return <Bike size={24} color="#034078" />;
    if (serviceName.toLowerCase().includes('perbaikan')) return <Wrench size={24} color="#034078" />;
    return <ShoppingBag size={24} color="#034078" />;
  };`
);

// Update JSX - groupedHistory
jsxContent = jsxContent.replace(
  /const groupedHistory = filteredData\.reduce\(\(acc, item\) => \{[\s\S]*?return acc;\s*\}, \{\}\);/m,
  `const groupedHistory = filteredData.reduce((acc, item) => {
    const groupKey = item.monthYearGroup;
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {});`
);

// Update JSX - Render Cards
jsxContent = jsxContent.replace(
  /<div className="history-icon" style=\{\{ backgroundColor: item\.isCanceled \? '#f1f5f9' : '#034078' \}\}>[\s\S]*?<\/div>\s*<div className="history-details">[\s\S]*?<h3 className="history-service-name">\{item\.service\}<\/h3>[\s\S]*?<p className="history-status">[\s\S]*?<span style=\{\{ color: item\.statusColor, fontWeight: '600' \}\}>\{item\.status\}<\/span> • \{item\.date\}[\s\S]*?<\/p>[\s\S]*?<p className="history-rating">\{item\.ratingText\}<\/p>[\s\S]*?<\/div>/m,
  `<div className="history-icon">
                    {getServiceIcon(item.service)}
                  </div>
                  <div className="history-details">
                    <h3 className="history-service-name">{item.service}</h3>
                    <p className="history-status">
                      <span style={{ color: item.statusColor, fontWeight: '500' }}>{item.status}</span> • {item.date}
                    </p>
                    {item.ratingValue ? (
                      <p className="history-rating rated">
                        Kamu memberi rating <span className="star-icon">★</span> {item.ratingValue.toFixed(1)}
                      </p>
                    ) : (
                      <p className="history-rating">{item.isCanceled ? (item.pesanan?.cancel_reason || 'Toko tutup') : 'Belum diberi rating'}</p>
                    )}
                  </div>`
);

fs.writeFileSync(jsxPath, jsxContent, 'utf8');

// Update CSS
cssContent = cssContent.replace(
  /\.history-month-title \{[\s\S]*?\}/,
  `.history-month-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #334155;
  margin: 0 0 12px 0;
}`
);

cssContent = cssContent.replace(
  /\.history-card \{[\s\S]*?\}/,
  `.history-card {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}`
);

cssContent = cssContent.replace(
  /\.history-icon \{[\s\S]*?\}/,
  `.history-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 16px;
  background-color: transparent;
}`
);

cssContent = cssContent.replace(
  /\.history-service-name \{[\s\S]*?\}/,
  `.history-service-name {
  font-family: 'Outfit', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 2px 0;
}`
);

cssContent = cssContent.replace(
  /\.history-status \{[\s\S]*?\}/,
  `.history-status {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 12px 0;
}`
);

cssContent = cssContent.replace(
  /\.history-rating \{[\s\S]*?\}/,
  `.history-rating {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}`
);

if (!cssContent.includes('.history-rating.rated')) {
  cssContent += `
.history-rating.rated {
  color: #64748b;
}
.star-icon {
  color: #fbbf24;
  font-size: 1.1rem;
}
`;
}

cssContent = cssContent.replace(
  /\.history-card\.canceled \.history-icon \{[\s\S]*?\}/,
  `.history-card.canceled .history-icon {
  opacity: 0.5;
}`
);

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('Update complete.');
