/* supabase-client.js — TERENA OIL */
(function () {
  const BASE = 'https://snlfewksihqyrgpiuusx.supabase.co/rest/v1';
  const KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNubGZld2tzaWhxeXJncGl1dXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNDU5NjEsImV4cCI6MjA5NjgyMTk2MX0.FagjdXt9PS7SUam6a9AHEeN_vg7mz7zbJ6AhPSTatAk';
  const H    = { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' };

  window.supa = {
    async insert(table, data) {
      const r = await fetch(BASE + '/' + table, {
        method: 'POST',
        headers: { ...H, 'Prefer': 'return=minimal' },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error(await r.text());
    },

    async select(table, { order = 'created_at.desc', limit = 200, filter = '' } = {}) {
      let url = `${BASE}/${table}?select=*&order=${order}&limit=${limit}`;
      if (filter) url += '&' + filter;
      const r = await fetch(url, { headers: H });
      if (!r.ok) throw new Error('Erreur lecture');
      return r.json();
    },

    async update(table, id, data) {
      const r = await fetch(`${BASE}/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...H, 'Prefer': 'return=minimal' },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error(await r.text());
    },
  };
})();
