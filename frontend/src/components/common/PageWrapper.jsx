import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import ChatbotButton from './Chatbot/ChatbotButton.jsx';

const PageWrapper = ({ children, showBackButton = false, backPath = null }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {showBackButton && backPath && (
          <div className="mb-6">
            <a
              href={backPath}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </a>
          </div>
        )}
        {children}
      </main>
      <Footer />
      <ChatbotButton />
    </div>
  );
};

export default PageWrapper;

