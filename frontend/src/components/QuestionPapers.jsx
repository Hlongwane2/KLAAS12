import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  BookOpen, 
  Calendar, 
  FileText, 
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  CheckCircle
} from 'lucide-react';

// Grade 12 Question Papers Database
const questionPapers = [
  // Mathematics
  {
    id: 1,
    subject: 'Mathematics',
    title: 'Mathematics Paper 1 - Algebra & Calculus',
    year: 2023,
    grade: 12,
    type: 'Final Exam',
    downloadUrl: 'https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx',
    topics: ['Algebra', 'Calculus', 'Number Patterns'],
    marks: 150,
    duration: '3 hours'
  },
  {
    id: 2,
    subject: 'Mathematics',
    title: 'Mathematics Paper 2 - Geometry & Trigonometry',
    year: 2023,
    grade: 12,
    type: 'Final Exam',
    downloadUrl: 'https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx',
    topics: ['Geometry', 'Trigonometry', 'Statistics'],
    marks: 150,
    duration: '3 hours'
  },
  {
    id: 3,
    subject: 'Mathematics',
    title: 'Mathematics Paper 1 - Midyear Exam',
    year: 2023,
    grade: 12,
    type: 'Midyear Exam',
    downloadUrl: 'https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx',
    topics: ['Algebra', 'Functions', 'Equations'],
    marks: 100,
    duration: '2 hours'
  },
  
  // Physical Sciences
  {
    id: 4,
    subject: 'Physical Sciences',
    title: 'Physics Paper 1 - Mechanics & Electricity',
    year: 2023,
    grade: 12,
    type: 'Final Exam',
    downloadUrl: 'https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx',
    topics: ['Mechanics', 'Electricity', 'Waves'],
    marks: 150,
    duration: '3 hours'
  },
  {
    id: 5,
    subject: 'Physical Sciences',
    title: 'Chemistry Paper 2 - Organic & Inorganic',
    year: 2023,
    grade: 12,
    type: 'Final Exam',
    downloadUrl: 'https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx',
    topics: ['Organic Chemistry', 'Chemical Equilibrium', 'Acids & Bases'],
    marks: 150,
    duration: '3 hours'
  },
  
  // Life Sciences
  {
    id: 6,
    subject: 'Life Sciences',
    title: 'Life Sciences Paper 1 - Biology',
    year: 2023,
    grade: 12,
    type: 'Final Exam',
    downloadUrl: 'https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx',
    topics: ['DNA & Genetics', 'Evolution', 'Human Biology'],
    marks: 150,
    duration: '2.5 hours'
  },
  {
    id: 7,
    subject: 'Life Sciences',
    title: 'Life Sciences Paper 2 - Ecology',
    year: 2023,
    grade: 12,
    type: 'Final Exam',
    downloadUrl: 'https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx',
    topics: ['Ecology', 'Biodiversity', 'Environmental Studies'],
    marks: 150,
    duration: '2.5 hours'
  },
  
  // English
  {
    id: 8,
    subject: 'English Home Language',
    title: 'English Paper 1 - Language & Comprehension',
    year: 2023,
    grade: 12,
    type: 'Final Exam',
    downloadUrl: 'https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx',
    topics: ['Comprehension', 'Summary', 'Language Structures'],
    marks: 80,
    duration: '2 hours'
  },
  {
    id: 9,
    subject: 'English Home Language',
    title: 'English Paper 2 - Literature',
    year: 2023,
    grade: 12,
    type: 'Final Exam',
    downloadUrl: 'https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx',
    topics: ['Poetry', 'Novel', 'Drama'],
    marks: 70,
    duration: '2.5 hours'
  },
  
  // Accounting
  {
    id: 10,
    subject: 'Accounting',
    title: 'Accounting Final Examination',
    year: 2023,
    grade: 12,
    type: 'Final Exam',
    downloadUrl: 'https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx',
    topics: ['Financial Statements', 'VAT', 'Company Accounting'],
    marks: 300,
    duration: '3 hours'
  },
  
  // Business Studies
  {
    id: 11,
    subject: 'Business Studies',
    title: 'Business Studies Final Exam',
    year: 2023,
    grade: 12,
    type: 'Final Exam',
    downloadUrl: 'https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx',
    topics: ['Business Ethics', 'Marketing', 'Management'],
    marks: 200,
    duration: '3 hours'
  },
  
  // Geography
  {
    id: 12,
    subject: 'Geography',
    title: 'Geography Paper 1 - Physical Geography',
    year: 2023,
    grade: 12,
    type: 'Final Exam',
    downloadUrl: 'https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx',
    topics: ['Climate', 'Geomorphology', 'Map Work'],
    marks: 225,
    duration: '3 hours'
  },
  {
    id: 13,
    subject: 'Geography',
    title: 'Geography Paper 2 - Human Geography',
    year: 2023,
    grade: 12,
    type: 'Final Exam',
    downloadUrl: 'https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx',
    topics: ['Settlement', 'Economic Geography', 'GIS'],
    marks: 225,
    duration: '3 hours'
  },
  
  // History
  {
    id: 14,
    subject: 'History',
    title: 'History Paper 1 - Source-Based',
    year: 2023,
    grade: 12,
    type: 'Final Exam',
    downloadUrl: 'https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx',
    topics: ['Cold War', 'Civil Rights', 'Independence Movements'],
    marks: 200,
    duration: '3 hours'
  },
  {
    id: 15,
    subject: 'History',
    title: 'History Paper 2 - Essay',
    year: 2023,
    grade: 12,
    type: 'Final Exam',
    downloadUrl: 'https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx',
    topics: ['Apartheid', 'World Wars', 'Global Changes'],
    marks: 200,
    duration: '3 hours'
  }
];

const subjects = ['All Subjects', 'Mathematics', 'Physical Sciences', 'Life Sciences', 'English Home Language', 'Accounting', 'Business Studies', 'Geography', 'History'];

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

  const handleDownload = (paper) => {
    // Add to downloaded list
    if (!downloadedPapers.includes(paper.id)) {
      setDownloadedPapers([...downloadedPapers, paper.id]);
    }
    
    // Open download link
    window.open(paper.downloadUrl, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto py-10 fade-in px-6">
      {/* Header */}
      <header className="mb-8">
        <button 
          onClick={onBack} 
          className="mb-6 btn-apple-secondary"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-[#0071E3]/10 flex items-center justify-center">
            <BookOpen size={24} className="text-[#0071E3]" />
          </div>
          <div>
            <h2 className="text-4xl font-semibold tracking-tight">Grade 12 Question Papers</h2>
            <p className="text-[#86868B] text-lg">Download past exam papers for practice</p>
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
          {/* Search */}
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

          {/* Subject Filter */}
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
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
                        <span className="flex items-center gap-1">
                          📝 {paper.marks} marks
                        </span>
                        <span className="flex items-center gap-1">
                          ⏱️ {paper.duration}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {paper.topics.map((topic, i) => (
                          <span 
                            key={i}
                            className="text-xs bg-[#F5F5F7] text-[#86868B] px-3 py-1 rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(paper)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    downloadedPapers.includes(paper.id)
                      ? 'bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759]/20'
                      : 'bg-[#0071E3] text-white hover:bg-[#0071E3]/90'
                  }`}
                >
                  {downloadedPapers.includes(paper.id) ? (
                    <>
                      <CheckCircle size={18} />
                      Downloaded
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Download
                    </>
                  )}
                </button>
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
            <h4 className="font-semibold mb-2">About Question Papers</h4>
            <p className="text-sm text-[#86868B] leading-relaxed">
              These question papers are sourced from the Department of Basic Education. Click download to access the official PDF files. 
              Use these papers to practice and prepare for your exams. All papers include memorandums (answer keys).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
