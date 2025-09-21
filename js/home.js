document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('whoForm');
  const sel  = document.getElementById('whoInput');
  if (!form || !sel) return;

  const VALID = ['Gaby','Mami Patty','Mami Barros'];

  const last = localStorage.getItem('lastTo');
  if (VALID.includes(last)) sel.value = last;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = sel.value;
    if (!VALID.includes(value)) {
      alert('Selecciona una opción válida');
      return;
    }
    localStorage.setItem('lastTo', value);
    window.location.href = `flowers.html?to=${encodeURIComponent(value)}`;
  });
});
