import React from "react";
import "./user_dashboard.css";

const borrowedBooks = [
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    dueDate: "Oct 12, 2023",
    dueDays: 2,
    status: "urgent",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWFkuFYpHolMlqwnFykH_dt-ej3QSt_pc7130lM4LSBFICTGkddUICOwDe5KI17lVEXpz0a60oS6PB3UyHyiCO2ubAmHXNVDYTkDh7meztbBvrTE-OHZvbhSEwafFmw7sxkv4glEqEURiClHi4Kpo_jm1KvenmqsmTzA8B7ySYzx8zlmAcDjXlC7nD0GMAIM4gHUO352YQlJEf1lkaKlKHxRTx1uyCh3KhhRXToH-MBx4vV-pmhTmJ1HylwwpUBCnR1W_bp0fetUHA",
    canRenew: true
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    dueDate: "Oct 15, 2023",
    dueDays: 12,
    status: "ok",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEb5xAVm5CRQiWUT4HBYkx-snTe02U1uiEWoYSq8XWDDfI13gCEYNxEA2u8qD86Z5XggY_zQFbEbJ1WkBc6w-fg3aARxayTNDUs9VKdZH5hcC7kFGBZ74-2f3wR3E_NLE39nMZsH-aaObfdW2ZXog0TJXQKpqZ_EyQvQsQxOEe0ryT1DycEUV__FpB7bDYHmVDrjr_At8QN1zcjRhuYgi9epDT3tjZYmgVoKx-4luxfd-1gVn1Am026ZfW749ImtYyCQQ9wM0PFKJB",
    canRenew: false
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    dueDate: "Oct 18, 2023",
    dueDays: 15,
    status: "ok",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMTfpzrRRFZtiT-3-nvLE98pJHSH3cniRWcvw12EG1WDttvFyENiTsjOCQocomiN9c5mIr1NwCTsjM_VUs49YRTLeNOxzJWtCm45637033FenCzCQ-OC4GIBoi1F_Lxk_Wkrs3EyH_RXx80XfDBQqjgJx9rvRsEKC7QjqfROyp_5AUY4b_L-LxOXx2Q_QC0f8x0Kc1kMbX1SuXWWM7RPq4pld2cUMft8KsUTtJY_oS7-EjQkc8u1cn3oZfiQ2MxHud6Nsjm9u-zlG-",
    canRenew: false
  }
];

const newArrivals = [
  {
    title: "Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    status: "Available Now",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPlxOi-wjLOyrGLKxonoSsAbJeko_4rt5G2Oj8T7NQCEttE0tb9dmnASuvfgHvzBKPynaRjPAqxdB-mEvpH2n-p1GulL0v5WTrkmWS7bkQgDEDSrIGNQwOUIjqfCDrc4IyBDT8OaP06ocmzcIsN9vJ5NZyFGrP8V6utumSUQbyzdKsY2hvC_kj9SWN6-fch6fWzOiy8gi9c0uMQ5VfNkhzIePzshiZ56j7B9fpAb4YyZW3ZgVZoDprJSG-xycghkAAf_-5ZmzB9esE"
  },
  {
    title: "Yellowface",
    author: "R.F. Kuang",
    status: "Available Now",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9t50QljRrZ6YGwuXJuKf01IoCeNEtrvXxRI3GGrRXrhzcWTRBfUxBngi9nSa7lWJ1ZGSDw74Zep-IbKzz7rWNYETL34PeaGixl2KJdHjQJgtRbGzI6vN08-hHs5blVDfLeSpYODE_n97X2qbD5YdonzrAqABSSwz8q1kVI5A43UFmWbIa0Yyac8NLTHiFpSOz9koRn64tLPYzFiAN32k3JuqXXQestNSdW2LcN9LJkWADZrwrr0gJoKbvDYpXNnz_6NixVymDA8vY"
  },
  {
    title: "Lessons in Chemistry",
    author: "Bonnie Garmus",
    status: "Waitlist: 3 days",
    statusType: "waitlist",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFMw-ybLXbKBN8aqcrkeafM4ddN_1Yn73m40O7JDtYkPHclDYvDxdNtpJslTmYVzcjlzO-DW2hY8q1o7ur_jhSVksL0jadC6erXqH8kU_Ghs4ks5J8wAJqlCDEOGGHEmvuwUHEKk0apFn35e40PdAzMfA3txBis6eQSEVIb9sPymm3KwZu7O0RCmiMqop3PcydIxvoU7m3XigkrDJINfFsRzAnQ0zbLwsrFf8DHP--G7q6vOCgNIpKEURs5fbWMZS2yMGdEtwpDXhb"
  }
];

const UserDashboard = () => {
  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1>Good Morning, Sarah!</h1>
          <p className="dashboard-subtitle">Manage your loans and find your next read.</p>
        </div>
        <div className="dashboard-search">
          <input placeholder="Search by title, author, or ISBN..." />
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-item stat-blue">
          <div className="stat-icon">📚</div>
          <div>
            <p className="stat-label">Active Loans</p>
            <p className="stat-value">4 <span>books</span></p>
          </div>
        </div>
        <div className="stat-item stat-orange">
          <div className="stat-icon">⏰</div>
          <div>
            <p className="stat-label">Due Soon</p>
            <p className="stat-value">1 <span>book</span></p>
          </div>
        </div>
        <div className="stat-item stat-green">
          <div className="stat-icon">💰</div>
          <div>
            <p className="stat-label">Fines Due</p>
            <p className="stat-value">$0.00</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="section-header">
            <h2>📖 Currently Borrowed</h2>
            <a href="#" className="view-all">View All</a>
          </div>

          <div className="books-list">
            {borrowedBooks.map((book, idx) => (
              <div key={idx} className="book-card">
                <div
                  className="book-cover"
                  style={{ backgroundImage: `url(${book.coverUrl})` }}
                />
                <div className="book-details">
                  <div>
                    <div className="book-header">
                      <h3>{book.title}</h3>
                      <span className={`due-badge due-${book.status}`}>
                        Due in {book.dueDays} days
                      </span>
                    </div>
                    <p className="book-author">{book.author}</p>
                    <p className="book-meta">📅 Borrowed: {book.dueDate}</p>
                  </div>
                  <div className="book-actions">
                    <button
                      className="btn-primary"
                      disabled={!book.canRenew}
                    >
                      Renew
                    </button>
                    <button className="btn-secondary">Return</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="section-header">
            <h2>✨ New Arrivals</h2>
            <div className="nav-arrows">
              <button>←</button>
              <button>→</button>
            </div>
          </div>

          <div className="arrivals-list">
            {newArrivals.map((book, idx) => (
              <div key={idx} className="arrival-card">
                <div
                  className="arrival-cover"
                  style={{ backgroundImage: `url(${book.coverUrl})` }}
                />
                <div className="arrival-info">
                  <h4>{book.title}</h4>
                  <p className="arrival-author">{book.author}</p>
                  <p className={`arrival-status ${book.statusType === 'waitlist' ? 'waitlist' : ''}`}>
                    {book.status}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="promo-banner">
            <p className="promo-label">Library News</p>
            <h3>Book Fair this Weekend!</h3>
            <p>Join us this Saturday for local authors and workshops.</p>
            <button className="btn-promo">Learn More</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;