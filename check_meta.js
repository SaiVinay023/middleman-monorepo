const http = require('http');
http.get('http://localhost:3000', res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const descMatch = data.match(/name="description" content="([^"]+)"/);
    console.log('meta description:', descMatch ? descMatch[1].substring(0, 80) : 'NOT FOUND');
    const titleMatch = data.match(/<title>([^<]+)<\/title>/);
    console.log('title:', titleMatch ? titleMatch[1] : 'NOT FOUND');
    const robotsMatch = data.match(/name="robots" content="([^"]+)"/);
    console.log('robots:', robotsMatch ? robotsMatch[1] : 'NOT FOUND');
  });
}).on('error', e => console.error(e));
