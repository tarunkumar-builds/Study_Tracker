import { useMemo, useState } from 'react';
import { Download, ExternalLink, FileText, GraduationCap } from 'lucide-react';

const paperFiles = [
  'CS1-2017.pdf',
  'CS1-2021.pdf',
  'CS12024.pdf',
  'CS12025.pdf',
  'CS2-2017.pdf',
  'CS2-2021.pdf',
  'CS2007.pdf',
  'CS2008.pdf',
  'CS2009.pdf',
  'CS2010.pdf',
  'CS2011.pdf',
  'CS2012.pdf',
  'CS2013.pdf',
  'CS2014.pdf',
  'CS2015.pdf',
  'CS2016.pdf',
  'CS2018.pdf',
  'CS2019.pdf',
  'CS2020.pdf',
  'CS2022.pdf',
  'CS2023.pdf',
  'CS22024.pdf',
  'CS22025.pdf'
];

const parsePaper = (fileName) => {
  const cleanName = fileName.replace('.pdf', '');
  const semesterMatch = cleanName.match(/^CS([12])-?(\d{4})$/i);
  const yearOnlyMatch = cleanName.match(/^CS(\d{4})$/i);

  if (semesterMatch) {
    const semester = Number(semesterMatch[1]);
    const year = Number(semesterMatch[2]);
    return {
      id: cleanName,
      fileName,
      year,
      semester,
      title: `CS Semester ${semester} - ${year}`,
      subtitle: `Semester ${semester} paper`,
      filePath: `/pyqs/${fileName}`
    };
  }

  if (yearOnlyMatch) {
    const year = Number(yearOnlyMatch[1]);
    return {
      id: cleanName,
      fileName,
      year,
      semester: null,
      title: `CS PYQ - ${year}`,
      subtitle: 'General question paper',
      filePath: `/pyqs/${fileName}`
    };
  }

  return {
    id: cleanName,
    fileName,
    year: 0,
    semester: null,
    title: cleanName,
    subtitle: 'Question paper',
    filePath: `/pyqs/${fileName}`
  };
};

const PreviousYearPapers = () => {
  const papers = useMemo(
    () => paperFiles.map(parsePaper).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return (b.semester || 0) - (a.semester || 0);
    }),
    []
  );
  const [selectedPaper, setSelectedPaper] = useState(papers[0]);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-1">
            Previous Year Question Papers
          </h1>
          <p className="text-gray-400">
            Browse all available PYQ PDFs in one place and open them directly in the browser.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:w-fit">
          <div className="card py-4 px-5 min-w-[140px]">
            <p className="text-gray-400 text-sm">Total Papers</p>
            <p className="text-2xl font-bold text-white mt-1">{papers.length}</p>
          </div>
          <div className="card py-4 px-5 min-w-[140px]">
            <p className="text-gray-400 text-sm">Latest Year</p>
            <p className="text-2xl font-bold text-white mt-1">{papers[0]?.year || '-'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <section className="card">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={18} className="text-primary-400" />
            <h2 className="text-white font-semibold">Available Papers</h2>
          </div>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
            {papers.map((paper) => {
              const isActive = selectedPaper?.id === paper.id;
              return (
                <button
                  key={paper.id}
                  type="button"
                  onClick={() => setSelectedPaper(paper)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    isActive
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-dark-border bg-dark-bg hover:border-primary-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-white font-semibold">{paper.title}</p>
                      <p className="text-sm text-gray-400 mt-1">{paper.subtitle}</p>
                    </div>
                    <FileText size={18} className={isActive ? 'text-primary-400' : 'text-gray-500'} />
                  </div>
                  <p className="text-xs text-gray-500 mt-3">{paper.fileName}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="card">
          {selectedPaper ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">{selectedPaper.title}</h2>
                  <p className="text-gray-400">{selectedPaper.fileName}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={selectedPaper.filePath}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Open PDF
                  </a>
                  <a
                    href={selectedPaper.filePath}
                    download={selectedPaper.fileName}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download
                  </a>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-dark-border bg-dark-bg">
                <iframe
                  title={selectedPaper.title}
                  src={`${selectedPaper.filePath}#toolbar=0`}
                  className="h-[75vh] w-full"
                />
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-gray-400">No question papers found.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PreviousYearPapers;
