document.getElementById('convert-form').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const formData = new FormData(event.target);
    const response = await fetch('/convert', {
      method: 'POST',
      body: formData,
    });
  
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'translated.srt';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      alert('An error occurred while converting the subtitle.');
    }
  });
  