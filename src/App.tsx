import React, { useState, useRef, useEffect } from 'react';
import { Upload, Send, BarChart3, FileText, MessageCircle, Clock, AlertCircle, CheckCircle, Download, Maximize2, X, TrendingUp, PieChart, Sparkles, Zap, Brain, Shield, ArrowRight, Play } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE = 'https://excel-ai-backend-production.up.railway.app';
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347'];

interface ApiResponse {
  sessionId?: string;
  totalRows?: number;
  columns?: string[];
  sampleData?: any[];
  expiresAt?: string;
  validFor?: string;
  initialQuestion?: string;
  initialResponse?: {
    type: string;
    aiResponse: string;
    calculations?: any;
    chartData?: ChartData;
  };
  question?: string;
  response?: {
    type: string;
    aiResponse: string;
    calculations?: any;
    chartData?: ChartData;
  };
  reportData?: string;
  generatedAt?: string;
}

interface ChartData {
  type: 'bar' | 'pie' | 'line';
  labels: string[];
  data: number[];
  title: string;
}

interface Message {
  type: 'user' | 'ai';
  content: string;
  calculations?: any;
  chartData?: ChartData;
  timestamp: string;
}

interface SessionData {
  sessionId: string;
  totalRows: number;
  columns: string[];
  sampleData: any[];
  expiresAt: string;
  validFor: string;
}

// Hook para manejar API calls
const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<ApiResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
        ...options,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la solicitud');
      }
      
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  return { apiCall, loading, error, clearError: () => setError(null) };
};

// Componente para mostrar gráficas con opción de ampliar
const ChartDisplay: React.FC<{ chartData: ChartData; onExpand: (data: ChartData) => void }> = ({ chartData, onExpand }) => {
  if (!chartData) return null;

  const data = chartData.labels.map((label, index) => ({
    name: label,
    value: chartData.data[index]
  }));

  const renderChart = (size: 'small' | 'large' = 'small') => {
    const height = size === 'large' ? 400 : 200;
    
    switch (chartData.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsPie>
              <RechartsPie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={size === 'large' ? 120 : 60}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </RechartsPie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return <div className="text-gray-500">Tipo de gráfica no soportado</div>;
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h4 className="chart-title">
          {chartData.type === 'pie' ? <PieChart size={16} /> : <BarChart3 size={16} />}
          {chartData.title}
        </h4>
        <button
          onClick={() => onExpand(chartData)}
          className="expand-btn"
          title="Ampliar gráfica"
        >
          <Maximize2 size={16} />
        </button>
      </div>
      {renderChart('small')}
    </div>
  );
};

// Modal para ampliar gráficas
const ChartModal: React.FC<{ chartData: ChartData | null; onClose: () => void }> = ({ chartData, onClose }) => {
  if (!chartData) return null;

  const data = chartData.labels.map((label, index) => ({
    name: label,
    value: chartData.data[index]
  }));

  const renderChart = () => {
    switch (chartData.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={500}>
            <RechartsPie>
              <RechartsPie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={180}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </RechartsPie>
              <Tooltip />
              <Legend />
            </RechartsPie>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return <div>Tipo de gráfica no soportado</div>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <TrendingUp size={20} />
            {chartData.title}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

// Componente Landing Page
const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Brain size={32} />,
      title: "AI-Powered Analysis",
      description: "Advanced artificial intelligence analyzes your financial data and provides intelligent insights in real-time."
    },
    {
      icon: <Zap size={32} />,
      title: "Instant Insights", 
      description: "Get immediate answers to complex questions about your portfolio, risk assessment, and performance metrics."
    },
    {
      icon: <BarChart3 size={32} />,
      title: "Dynamic Visualizations",
      description: "Beautiful, interactive charts and graphs that adapt to your questions and reveal hidden patterns."
    },
    {
      icon: <Shield size={32} />,
      title: "Secure & Private",
      description: "Your data stays safe with 2-day sessions, no permanent storage, and enterprise-grade security."
    }
  ];

  const stats = [
    { number: "10x", label: "Faster Analysis", description: "Compare to manual Excel analysis" },
    { number: "99%", label: "Accuracy Rate", description: "AI-powered data interpretation" },
    { number: "2min", label: "Setup Time", description: "From upload to insights" },
    { number: "24/7", label: "Available", description: "Analyze data anytime" }
  ];

  return (
    <div className="landing-page">
      {/* Animated Background */}
      <div className="bg-animated">
        <div 
          className="bg-blob bg-blob-1"
          style={{
            left: mousePosition.x / 10,
            top: mousePosition.y / 10,
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
        <div className="bg-blob bg-blob-4" />
      </div>

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="container">
          <div className="nav-content">
            <div className="logo">
              <div className="logo-icon">
                <BarChart3 size={28} />
              </div>
              <span className="logo-text">Excel AI</span>
            </div>
            <button onClick={onGetStarted} className="nav-cta">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Analyze Your
              <span className="hero-highlight"> Data </span>
              <br />
              Like Never Before
            </h1>
            <p className="hero-subtitle">
              Transform your Excel files into intelligent conversations. Ask questions, get instant insights, 
              and generate professional reports with the power of AI.
            </p>

            <div className="hero-buttons">
              <button onClick={onGetStarted} className="btn-primary">
                <Sparkles size={24} />
                Start Analyzing
                <ArrowRight size={20} />
              </button>
              <button className="btn-secondary">
                <Play size={20} />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-description">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-header">
            <h2 className="features-title">Powerful Features</h2>
            <p className="features-subtitle">
              Everything you need to transform your data into actionable intelligence
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">
              Ready to Transform Your
              <span className="cta-highlight"> Analysis?</span>
            </h2>
            <p className="cta-subtitle">
              Join thousands of analysts who've revolutionized their data workflows with AI-powered insights.
            </p>
            
            <button onClick={onGetStarted} className="cta-button">
              <Sparkles size={24} />
              Start Your Free Analysis
              <ArrowRight size={24} />
            </button>
            
            <p className="cta-note">
              No signup required • 2-day free sessions • Enterprise ready
            </p>
          </div>
        </div>
      </section>

      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="floating-dot floating-dot-1" />
        <div className="floating-dot floating-dot-2" />
        <div className="floating-dot floating-dot-3" />
        <div className="floating-dot floating-dot-4" />
      </div>
    </div>
  );
};

// Componente para upload de archivos
const FileUpload: React.FC<{ onFileUploaded: (data: ApiResponse) => void; disabled: boolean }> = ({ onFileUploaded, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState('');
  const { apiCall, loading, error } = useAPI();

  const handleUpload = async (file: File, question = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (question.trim()) {
      formData.append('question', question.trim());
    }

    try {
      const result = await apiCall('/api/upload', {
        method: 'POST',
        body: formData,
      });
      onFileUploaded(result);
      setInitialQuestion('');
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files[0], initialQuestion);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0], initialQuestion);
    }
  };

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''} ${loading ? 'loading' : ''}`}
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !disabled && !loading && fileInputRef.current?.click()}
      >
        <div className="upload-icon-container">
          <Upload size={64} className={loading ? 'animate-bounce' : ''} />
          {loading && <div className="upload-spinner" />}
        </div>
        
        <h3 className="upload-title">
          {loading ? 'Processing your file...' : 'Upload Excel or CSV'}
        </h3>
        <p className="upload-subtitle">
          {loading ? 'Analyzing data with AI...' : 'Drag and drop or click to select your financial data'}
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={disabled || loading}
        />
        
        <div className="upload-question">
          <input
            type="text"
            placeholder="Ask an initial question about your data..."
            value={initialQuestion}
            onChange={(e) => setInitialQuestion(e.target.value)}
            disabled={loading}
            className="question-input"
          />
          
          {loading && (
            <div className="loading-dots">
              <div className="dot dot-1" />
              <div className="dot dot-2" />
              <div className="dot dot-3" />
              <span>Analyzing with AI...</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Componente para mostrar métricas
const MetricsDisplay: React.FC<{ calculations: any }> = ({ calculations }) => {
  if (!calculations) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  return (
    <div className="metrics-grid">
      {calculations.totalRegistros && (
        <div className="metric-card metric-blue">
          <div className="metric-number">{calculations.totalRegistros.toLocaleString()}</div>
          <div className="metric-label">Total Credits</div>
        </div>
      )}
      {calculations.montoTotalUSD && (
        <div className="metric-card metric-green">
          <div className="metric-number">{formatNumber(calculations.montoTotalUSD)}</div>
          <div className="metric-label">Total Disbursed</div>
        </div>
      )}
      {calculations.saldoPendienteTotal && (
        <div className="metric-card metric-orange">
          <div className="metric-number">{formatNumber(calculations.saldoPendienteTotal)}</div>
          <div className="metric-label">Pending Balance</div>
        </div>
      )}
      {calculations.promedioTasaInteres && (
        <div className="metric-card metric-purple">
          <div className="metric-number">{calculations.promedioTasaInteres.toFixed(1)}%</div>
          <div className="metric-label">Avg Interest Rate</div>
        </div>
      )}
    </div>
  );
};

// Componente principal del chat
const ChatMessage: React.FC<{ message: Message; onExpandChart: (data: ChartData) => void }> = ({ message, onExpandChart }) => {
  const isUser = message.type === 'user';
  
  return (
    <div className={`chat-message ${isUser ? 'user' : 'ai'}`}>
      <div className="message-container">
        {isUser ? (
          <div className="user-message">
            <div className="user-avatar">
              <MessageCircle size={16} />
            </div>
            <p className="message-text">{message.content}</p>
          </div>
        ) : (
          <div className="ai-message">
            <div className="ai-avatar">
              <BarChart3 size={16} />
            </div>
            <div className="ai-content">
              <p className="message-text">{message.content}</p>
              {message.calculations && <MetricsDisplay calculations={message.calculations} />}
              {message.chartData && (
                <ChartDisplay 
                  chartData={message.chartData} 
                  onExpand={onExpandChart}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente principal con navegación entre landing y app
const ExcelAIChat: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [expandedChart, setExpandedChart] = useState<ChartData | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { apiCall, loading, error, clearError } = useAPI();

  // Auto-scroll al final del chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleGetStarted = () => {
    setCurrentView('app');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setSessionData(null);
    setMessages([]);
  };

  const handleFileUploaded = (uploadResult: ApiResponse) => {
    const sessionInfo: SessionData = {
      sessionId: uploadResult.sessionId!,
      totalRows: uploadResult.totalRows!,
      columns: uploadResult.columns!,
      sampleData: uploadResult.sampleData!,
      expiresAt: uploadResult.expiresAt!,
      validFor: uploadResult.validFor!
    };
    
    setSessionData(sessionInfo);
    
    // Mensaje de bienvenida
    const welcomeMessage: Message = {
      type: 'ai',
      content: `✅ File processed successfully!\n\n📊 **${uploadResult.totalRows?.toLocaleString()} records** loaded\n📋 **${uploadResult.columns?.length} columns** detected\n⏰ Session valid for **2 days**\n\nYou can now ask me anything about your data!`,
      timestamp: new Date().toISOString()
    };

    let newMessages = [welcomeMessage];

    // Si hubo pregunta inicial, agregar la respuesta
    if (uploadResult.initialResponse) {
      newMessages.push(
        {
          type: 'user',
          content: uploadResult.initialQuestion!,
          timestamp: new Date().toISOString()
        },
        {
          type: 'ai',
          content: uploadResult.initialResponse.aiResponse,
          calculations: uploadResult.initialResponse.calculations,
          chartData: uploadResult.initialResponse.chartData,
          timestamp: new Date().toISOString()
        }
      );
    }

    setMessages(newMessages);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      const result = await apiCall('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          question: inputValue,
          sessionId: sessionData?.sessionId
        }),
      });

      const aiMessage: Message = {
        type: 'ai',
        content: result.response!.aiResponse,
        calculations: result.response!.calculations,
        chartData: result.response!.chartData,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage: Message = {
        type: 'ai',
        content: `❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const generateReport = async () => {
    if (!sessionData?.sessionId) {
      console.error('No session available for report generation');
      return;
    }

    try {
      // Show loading message
      const loadingMessage: Message = {
        type: 'ai',
        content: '🔄 **Generating Strategic Report...**\n\nAnalyzing your data and creating comprehensive insights...',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, loadingMessage]);

      // Call the API to generate Word report
      const response = await fetch(`${API_BASE}/api/generate-report-word`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionData.sessionId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error generating report');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = `Strategic_Report_${new Date().toISOString().split('T')[0]}.docx`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Update the loading message to success
      setMessages(prev => 
        prev.slice(0, -1).concat([{
          type: 'ai',
          content: `📥 **Strategic Report Generated Successfully**\n\n✅ File: ${fileName}\n📁 Format: Microsoft Word\n📊 Complete analysis with visualizations and recommendations\n\nThe report has been downloaded to your computer.`,
          timestamp: new Date().toISOString()
        }])
      );

    } catch (err) {
      console.error('Report error:', err);
      // Update the loading message to error
      setMessages(prev => 
        prev.slice(0, -1).concat([{
          type: 'ai',
          content: `❌ **Error Generating Report**\n\nSorry, there was an issue creating your strategic report: ${err instanceof Error ? err.message : 'Unknown error'}\n\nPlease try again or contact support if the problem persists.`,
          timestamp: new Date().toISOString()
        }])
      );
    }
  };
  // Mostrar landing page o app
  if (currentView === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <button onClick={handleBackToLanding} className="logo-button">
                <BarChart3 size={24} />
              </button>
              <div className="header-info">
                <h1 className="header-title">Excel AI Analyst</h1>
                <p className="header-subtitle">Intelligent data analysis powered by AI</p>
              </div>
            </div>
            
            {sessionData && (
              <div className="header-right">
                <div className="session-info">
                  <div className="session-records">
                    {sessionData.totalRows?.toLocaleString()} records
                  </div>
                  <div className="session-timer">
                    <Clock size={12} />
                    Session expires in 2 days
                  </div>
                </div>
                <button
                  onClick={generateReport}
                  disabled={loading}
                  className="generate-report-btn"
                >
                  <FileText size={16} />
                  Generate Report
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {!sessionData ? (
            /* Upload Screen */
            <div className="upload-screen">
              <div className="upload-content">
                <div className="upload-header">
                  <h2 className="upload-title">Ready to Analyze Your Data?</h2>
                  <p className="upload-description">
                    Upload your Excel or CSV file and start having intelligent conversations about your financial data
                  </p>
                </div>
                
                <FileUpload onFileUploaded={handleFileUploaded} disabled={loading} />
                
                <div className="features-preview">
                  <div className="feature-preview">
                    <div className="preview-icon preview-blue">
                      <BarChart3 size={24} />
                    </div>
                    <h4 className="preview-title">Smart Analytics</h4>
                    <p className="preview-description">Ask questions and get instant insights with beautiful visualizations</p>
                  </div>
                  <div className="feature-preview">
                    <div className="preview-icon preview-green">
                      <MessageCircle size={24} />
                    </div>
                    <h4 className="preview-title">Natural Conversation</h4>
                    <p className="preview-description">Chat naturally about your data like talking to an expert analyst</p>
                  </div>
                  <div className="feature-preview">
                    <div className="preview-icon preview-purple">
                      <FileText size={24} />
                    </div>
                    <h4 className="preview-title">Strategic Reports</h4>
                    <p className="preview-description">Generate professional analysis reports with actionable recommendations</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <div className="chat-layout">
              {/* Chat Area */}
              <div className="chat-area">
                {/* Messages Container */}
                <div ref={chatContainerRef} className="messages-container">
                  {messages.map((message, index) => (
                    <ChatMessage 
                      key={index} 
                      message={message} 
                      onExpandChart={setExpandedChart}
                    />
                  ))}
                  
                  {loading && (
                    <div className="loading-message">
                      <div className="loading-container">
                        <div className="ai-loading-avatar">
                          <Brain size={16} />
                          <div className="loading-pulse" />
                        </div>
                        <div className="loading-content">
                          <div className="loading-dots-container">
                            <div className="loading-dot loading-dot-1" />
                            <div className="loading-dot loading-dot-2" />
                            <div className="loading-dot loading-dot-3" />
                          </div>
                          <span className="loading-text">AI analyzing your data...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="input-area">
                  <div className="input-container">
                    <div className="input-wrapper">
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask anything about your data... 💬"
                        disabled={loading}
                        className="chat-input"
                        rows={1}
                        style={{
                          minHeight: '48px',
                          maxHeight: '120px',
                          height: Math.min(120, Math.max(48, inputValue.split('\n').length * 24))
                        }}
                      />
                      {inputValue.trim() && (
                        <div className="input-hint">
                          Press Enter to send
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || loading}
                      className="send-button"
                    >
                      <Send size={20} />
                      <span>Send</span>
                    </button>
                  </div>
                  
                  {error && (
                    <div className="chat-error">
                      <AlertCircle size={20} />
                      <span>{error}</span>
                      <button onClick={clearError} className="error-close">
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="sidebar">
                {/* Quick Actions */}
                <div className="sidebar-section">
                  <h3 className="sidebar-title">
                    <Zap size={20} />
                    Quick Analysis
                  </h3>
                  <div className="quick-actions">
                    {[
                      { q: "¿Cuántos créditos están vencidos?", icon: "⚠️" },
                      { q: "Muestra distribución por calificación", icon: "📊" },
                      { q: "¿Cuál es el saldo total pendiente?", icon: "💰" },
                      { q: "¿Qué agencia tiene mejor desempeño?", icon: "🏆" }
                    ].map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setInputValue(item.q)}
                        className="quick-action-btn"
                      >
                        <span className="action-icon">{item.icon}</span>
                        <span className="action-text">{item.q}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Session Info */}
                {sessionData && (
                  <div className="sidebar-section">
                    <h3 className="sidebar-title">
                      <CheckCircle size={20} />
                      Session Active
                    </h3>
                    <div className="session-details">
                      <div className="session-item session-blue">
                        <span className="session-label">Records:</span>
                        <span className="session-value">{sessionData.totalRows?.toLocaleString()}</span>
                      </div>
                      <div className="session-item session-purple">
                        <span className="session-label">Columns:</span>
                        <span className="session-value">{sessionData.columns?.length}</span>
                      </div>
                      <div className="session-item session-green">
                        <span className="session-label">Valid for:</span>
                        <span className="session-value">2 days</span>
                      </div>
                      <div className="session-actions">
                        <button
                          onClick={() => {
                            setSessionData(null);
                            setMessages([]);
                          }}
                          className="new-file-btn"
                        >
                          📎 Upload new file
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data Preview */}
                {sessionData?.sampleData && (
                  <div className="sidebar-section">
                    <h3 className="sidebar-title">
                      <FileText size={20} />
                      Data Structure
                    </h3>
                    <div className="data-preview">
                      {sessionData.columns?.slice(0, 6).map((col, index) => (
                        <div key={index} className="preview-row">
                          <span className="col-name">{col}</span>
                          <span className="col-type">
                            {typeof sessionData.sampleData[0]?.[col]}
                          </span>
                        </div>
                      ))}
                      {sessionData.columns?.length > 6 && (
                        <div className="more-columns">
                          <span className="more-badge">
                            +{sessionData.columns.length - 6} more columns
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Chart Modal */}
      {expandedChart && (
        <ChartModal 
          chartData={expandedChart} 
          onClose={() => setExpandedChart(null)}
        />
      )}

      {/* Error Toast */}
      {error && !loading && (
        <div className="error-toast">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={clearError} className="toast-close">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Success Toast */}
      {sessionData && messages.length === 0 && (
        <div className="success-toast">
          <CheckCircle size={20} />
          <span>File uploaded successfully! Start asking questions.</span>
        </div>
      )}
    </div>
  );
};

export default ExcelAIChat;