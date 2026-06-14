import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.message}>
              An unexpected error occurred. Your data is safe.
            </p>
            {import.meta.env.DEV && (
              <pre style={styles.debug}>
                {this.state.error?.message}
              </pre>
            )}
            <button style={styles.btn} onClick={() => this.handleReset()}>
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight:      '100vh',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    background:     '#0d1117',
    padding:        '24px',
  },
  card: {
    background:   '#161b22',
    border:       '1px solid #30363d',
    borderRadius: '14px',
    padding:      '40px',
    maxWidth:     '480px',
    width:        '100%',
    textAlign:    'center',
  },
  title: {
    color:      '#f0f6fc',
    fontSize:   '20px',
    fontWeight: '600',
    margin:     '0 0 12px',
  },
  message: {
    color:      '#8b949e',
    fontSize:   '14px',
    lineHeight: '1.6',
    margin:     '0 0 24px',
  },
  debug: {
    background:   '#0d1117',
    border:       '1px solid #30363d',
    borderRadius: '8px',
    padding:      '12px',
    color:        '#f85149',
    fontSize:     '12px',
    textAlign:    'left',
    overflowX:    'auto',
    margin:       '0 0 24px',
    whiteSpace:   'pre-wrap',
    wordBreak:    'break-word',
  },
  btn: {
    background:   '#238636',
    border:       'none',
    borderRadius: '8px',
    color:        '#fff',
    cursor:       'pointer',
    fontSize:     '14px',
    fontWeight:   '600',
    padding:      '10px 24px',
  },
};

export default ErrorBoundary;