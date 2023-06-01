const ctx = document.getElementById('lineChart').getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'August', 'Sept', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Earnings in $',
        data: [2025, 2045, 4567, 5543, 2200, 1000, 4479, 6789, 2333, 7560, 1267, 6789],
        backgroundColor: ['rgba(85, 85, 85, 1)'],
        borderColor: ['rgba(41, 155, 99)'],
        borderWidth: 1
      }] 
    },
    options: {
        responsive : true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });