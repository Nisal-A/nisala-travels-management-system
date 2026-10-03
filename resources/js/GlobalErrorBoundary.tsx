import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', backgroundColor: '#fdd', color: '#900', fontFamily: 'monospace' }}>
                    <h2>React Crash (Global Error Boundary)</h2>
                    <p>{this.state.error && this.state.error.toString()}</p>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '10px', color: '#500' }}>
                        {this.state.error && this.state.error.stack}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}
