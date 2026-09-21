const fullList = [
  { id: 1, url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80' },
  { id: 2, url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80' },
  { id: 3, url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80' },
  { id: 4, url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80' },
  { id: 5, url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80' },
  { id: 6, url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80' },
  { id: 7, url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80' },
  { id: 8, url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80' },
  { id: 9, url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80' },
  { id: 10, url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80' },
  { id: 11, url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80' },
  { id: 12, url: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&w=1200&q=80' }
];

async function checkAll() {
  let allOk = true;
  for (const item of fullList) {
    try {
      const res = await fetch(item.url, { method: 'HEAD' });
      if (res.status === 200) {
        console.log(`[OK 200] #${item.id}`);
      } else {
        console.log(`[ERROR ${res.status}] #${item.id}: ${item.url}`);
        allOk = false;
      }
    } catch(e) {
      console.log(`[FAIL] #${item.id}: ${e.message}`);
      allOk = false;
    }
  }
  console.log('ALL PASSED:', allOk);
}
checkAll();
