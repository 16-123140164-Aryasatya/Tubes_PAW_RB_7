export default function Loading({ label = "Loading...", fullScreen = false }) {
  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(2px)'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px 48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}>
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 48 48" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <circle 
              cx="24" 
              cy="24" 
              r="20" 
              fill="none" 
              stroke="#e5e7eb" 
              strokeWidth="4"
            />
            <circle 
              cx="24" 
              cy="24" 
              r="20" 
              fill="none" 
              stroke="#2563eb" 
              strokeWidth="4"
              strokeDasharray="31.4 94.2"
              strokeLinecap="round"
            />
          </svg>
          <div style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#333',
            textAlign: 'center'
          }}>{label}</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="loading">
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 48 48" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ animation: 'spin 1s linear infinite' }}
      >
        <circle 
          cx="24" 
          cy="24" 
          r="20" 
          fill="none" 
          stroke="#e5e7eb" 
          strokeWidth="4"
        />
        <circle 
          cx="24" 
          cy="24" 
          r="20" 
          fill="none" 
          stroke="#2563eb" 
          strokeWidth="4"
          strokeDasharray="31.4 94.2"
          strokeLinecap="round"
        />
      </svg>
      <div>{label}</div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
