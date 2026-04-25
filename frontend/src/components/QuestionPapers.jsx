import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  BookOpen, 
  Calendar, 
  FileText, 
  Search,
  ChevronDown,
  CheckCircle,
  X,
  Eye,
  ExternalLink
} from 'lucide-react';

// Real Grade 12 Question Papers with working download URLs
const questionPapers = [
  {
    id: 1,
    subject: 'Mathematics',
    title: 'Mathematics Paper 1 - November 2023',
    year: 2023,
    type: 'NSC Final Exam',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/01/NC-2023-Paper-1-Mathematics.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/01/NC-2023-Paper-1-Mathematics-Memo.pdf',
    topics: ['Algebra', 'Calculus', 'Number Patterns', 'Functions'],
    marks: 150,
    duration: '3 hours'
  },
  {
    id: 2,
    subject: 'Mathematics',
    title: 'Mathematics Paper 2 - November 2023',
    year: 2023,
    type: 'NSC Final Exam',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/01/NC-2023-Paper-2-Mathematics.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/01/NC-2023-Paper-2-Mathematics-Memo.pdf',
    topics: ['Geometry', 'Trigonometry', 'Statistics', 'Probability'],
    marks: 150,
    duration: '3 hours'
  },
  {
    id: 3,
    subject: 'Physical Sciences',
    title: 'Physics Paper 1 - November 2023',
    year: 2023,
    type: 'NSC Final Exam',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/01/NC-2023-Paper-1-Physical-Sciences-Physics.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/01/NC-2023-Paper-1-Physical-Sciences-Physics-Memo.pdf',
    topics: ['Mechanics', 'Electricity', 'Waves', 'Optics'],
    marks: 150,
    duration: '3 hours'
  },
  {
    id: 4,
    subject: 'Physical Sciences',
    title: 'Chemistry Paper 2 - November 2023',
    year: 2023,
    type: 'NSC Final Exam',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/01/NC-2023-Paper-2-Physical-Sciences-Chemistry.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/01/NC-2023-Paper-2-Physical-Sciences-Chemistry-Memo.pdf',
    topics: ['Organic Chemistry', 'Chemical Equilibrium', 'Acids & Bases'],
    marks: 150,
    duration: '3 hours'
  },
  {
    id: 5,
    subject: 'Life Sciences',
    title: 'Life Sciences Paper 1 - November 2023',
    year: 2023,
    type: 'NSC Final Exam',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/01/NC-2023-Paper-1-Life-Sciences.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/01/NC-2023-Paper-1-Life-Sciences-Memo.pdf',
    topics: ['DNA & Genetics', 'Evolution', 'Human Biology'],
    marks: 150,
    duration: '2.5 hours'
  },
  {
    id: 6,
    subject: 'English Home Language',
    title: 'English Paper 1 - November 2023',
    year: 2023,
    type: 'NSC Final Exam',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/01/NC-2023-Paper-1-English-Home-Language.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/01/NC-2023-Paper-1-English-Home-Language-Memo.pdf',
    topics: ['Comprehension', 'Summary', 'Language Structures'],
    marks: 80,
    duration: '2 hours'
  },
  {
    id: 7,
    subject: 'Accounting',
    title: 'Accounting - November 2023',
    year: 2023,
    type: 'NSC Final Exam',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/01/NC-2023-Accounting.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/01/NC-2023-Accounting-Memo.pdf',
    topics: ['Financial Statements', 'VAT', 'Company Accounting'],
    marks: 300,
    duration: '3 hours'
  },
  {
    id: 8,
    subject: 'Geography',
    title: 'Geography Paper 1 - November 2023',
    year: 2023,
    type: 'NSC Final Exam',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/01/NC-2023-Paper-1-Geography.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/01/NC-2023-Paper-1-Geography-Memo.pdf',
    topics: ['Climate', 'Geomorphology', 'Map Work'],
    marks: 225,
    duration: '3 hours'
  }
];

const subjects = ['All Subjects', 'Mathematics', 'Physical Sciences', 'Life Sciences', 'English Home Language', 'Accounting', 'Geography'];

export default function QuestionPapers({ onBack }) {
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadedPapers, setDownloadedPapers] = useState([]);

  const filteredPapers = questionPapers.filter(paper => {
    const matchesSubject = selectedSubject === 'All Subjects' || paper.subject === selectedSubject;
    const matchesSearch = paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         paper.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  const handleDownload = async (paper, type = 'question') => {
    if (!downloadedPapers.includes(paper.id)) {
      setDownloadedPapers([...downloadedPapers, paper.id]);
    }
    
    const url = type === 'question' ? paper.pdfUrl : paper.memoUrl;
    
    try {
      // Fetch the PDF file
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');
      
      // Convert to blob
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${paper.title} - ${type === 'question' ? 'Question Paper' : 'Memorandum'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 fade-in px-6">
      {/* Header */}
      <header className="mb-8">
        <button 
          onClick={onBack} 
          className="mb-6 btn-apple-secondary"
        >
          ← Back to Dashboard
        </button>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-[#0071E3]/10 flex items-center justify-center">
            <BookOpen size={24} className="text-[#0071E3]" />
          </div>
          <div>
            <h2 className="text-4xl font-semibold tracking-tight">Grade 12 Question Papers</h2>
            <p className="text-[#86868B] text-lg">Download past exam papers and memorandums</p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="apple-card p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#86868B] mb-1">Total Papers</p>
          <p className="text-3xl font-semibold text-[#0071E3]">{questionPapers.length}</p>
        </div>
        <div className="apple-card p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#86868B] mb-1">Subjects</p>
          <p className="text-3xl font-semibold text-[#34C759]">{subjects.length - 1}</p>
        </div>
        <div className="apple-card p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#86868B] mb-1">Downloaded</p>
          <p className="text-3xl font-semibold text-[#FF9500]">{downloadedPapers.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="apple-card p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" />
            <input 
              type="text" 
              placeholder="Search papers or topics..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F5F5F7] border border-[#E8E8ED] rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-[#0071E3] transition-colors"
            />
          </div>

          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="appearance-none bg-[#F5F5F7] border border-[#E8E8ED] rounded-xl py-3 pl-4 pr-10 text-sm outline-none focus:border-[#0071E3] transition-colors cursor-pointer"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Papers List */}
      <div className="space-y-4">
        {filteredPapers.length > 0 ? (
          filteredPapers.map((paper, index) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="apple-card p-6 hover:border-[#0071E3]/30 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0">
                    <FileText size={24} className="text-[#0071E3]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{paper.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-[#86868B] mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {paper.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} /> {paper.type}
                      </span>
                      <span>📝 {paper.marks} marks</span>
                      <span>⏱️ {paper.duration}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {paper.topics.map((topic, i) => (
                        <span key={i} className="text-xs bg-[#F5F5F7] text-[#86868B] px-3 py-1 rounded-full">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 lg:flex-col">
                  <button
                    onClick={() => handleDownload(paper, 'question')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all flex-1 lg:flex-none ${
                      downloadedPapers.includes(paper.id)
                        ? 'bg-[#34C759]/10 text-[#34C759]'
                        : 'bg-[#0071E3] text-white hover:bg-[#0071E3]/90'
                    }`}
                  >
                    {downloadedPapers.includes(paper.id) ? (
                      <><CheckCircle size={18} /> Done</>
                    ) : (
                      <><Download size={18} /> Paper</>
                    )}
                  </button>
                  <button
                    onClick={() => handleDownload(paper, 'memo')}
                    className="flex items-center gap-2 px-4 py-3 bg-[#FF9500]/10 text-[#FF9500] rounded-xl font-semibold hover:bg-[#FF9500]/20 transition-all flex-1 lg:flex-none"
                  >
                    <ExternalLink size={18} />
                    Memo
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="apple-card p-12 text-center">
            <FileText size={48} className="mx-auto text-[#D2D2D7] mb-4 opacity-20" />
            <p className="text-[#86868B] text-lg">No papers found matching your criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('All Subjects');
              }}
              className="mt-4 text-[#0071E3] font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="apple-card p-6 mt-8 bg-[#0071E3]/5 border-[#0071E3]/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#0071E3]/10 flex items-center justify-center shrink-0">
            <ExternalLink size={20} className="text-[#0071E3]" />
          </div>
          <div>
            <h4 className="font-semibold mb-2">How to Use</h4>
            <p className="text-sm text-[#86868B] leading-relaxed">
              Click "Paper" to download the question paper PDF. Click "Memo" to download the memorandum (answer key). 
              Papers will open in a new tab from the Department of Basic Education website. Practice with past papers is one of the best ways to prepare for your exams!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
