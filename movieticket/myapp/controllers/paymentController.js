// controllers/paymentController.js
const pool = require('../models/db');

// สร้างฟังก์ชัน shapeMovies สำหรับ normalize poster
function shapeMovies(rows) {
  return rows.map(m => {
    const p = m.poster_url || '';
    const needsPrefix = p && !p.startsWith('http') && !p.startsWith('posters/') && !p.startsWith('images/');
    return { ...m, poster_url: p ? (needsPrefix ? `posters/${p}` : p) : 'posters/default.png' };
  });
}

function shapeMovie(row) {
  return shapeMovies([row])[0];
}

// แสดงหน้าจ่ายเงิน
exports.showPaymentPage = async (req, res) => {
  try {
    const { showtime, seats } = req.query;
    if (!showtime || !seats) return res.status(400).send("Invalid request");

    const [rows] = await pool.query(`
      SELECT s.id AS showtime_id,
             s.start_utc,
             s.base_price,
             s.currency,
             sc.name AS theater,
             m.id AS movie_id,
             m.title, m.poster_url, m.rating, m.duration_min
      FROM showtimes s
      JOIN screens sc ON s.screen_id = sc.id
      JOIN movies m   ON s.movie_id   = m.id
      WHERE s.id = ?`,
      [showtime]
    );

    if (!rows.length) return res.status(404).send("Showtime not found");
    const st = rows[0];

    const seatArr = seats.split(',');
    const booking = {
      showtime_id: st.showtime_id,
      movie_id: st.movie_id,
      date: new Date(st.start_utc).toLocaleDateString('en-US'),
      time: new Date(st.start_utc).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      theater: st.theater,
      seats: seatArr,
      total: st.base_price * seatArr.length,
      currency: st.currency
    };

    // ใช้ shapeMovie สำหรับ object เดียว
    const movie = shapeMovie({
      id: st.movie_id,
      title: st.title,
      poster_url: st.poster_url,
      rating: st.rating,
      duration_min: st.duration_min
    });

    res.render('payments/payment', { booking, movie, user: req.session.user || null });
  } catch (err) {
    console.error("Error in showPaymentPage:", err);
    res.status(500).send("Server error");
  }
};

// Mock Payment Confirm
exports.confirmPayment = async (req, res) => {
  try {
    const { showtime_id, seats, card_name, movie_id } = req.body;

    await pool.query(
      `INSERT INTO bookings (showtime_id, movie_id, seats, card_name, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [showtime_id, movie_id, seats, card_name]
    );

    res.render('payments/success', {
      message: "Payment Successful!",
      booking: { showtime_id, seats }
    });
  } catch (err) {
    console.error("Error in confirmPayment:", err);
    res.status(500).send("Payment failed");
  }
};
