import http from 'http';

http.get('http://localhost:8000/api/resource/Workspace?limit=100', {
  headers: { 'Authorization': 'token 9d784a95bb247bc:64b4c4fae96ba45' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Workspaces:', parsed.data.map(w => w.name));
    } catch(e) {
      console.log('Raw data:', data);
    }
  });
});
