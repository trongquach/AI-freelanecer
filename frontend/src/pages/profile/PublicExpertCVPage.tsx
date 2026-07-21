import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cvApi } from '@/api/cvApi';
import { Globe, Briefcase, GraduationCap, Award, Github, ChevronLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function PublicExpertCVPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: cv, isLoading, error } = useQuery({
    queryKey: ['expert-cv', id],
    queryFn: () => cvApi.getCVByUserId(Number(id)),
    enabled: !!id,
    retry: false
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !cv) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">CV Not Found</h2>
        <p className="text-slate-600">The expert has not created a CV or it is unavailable.</p>
        <Button variant="primary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expert's CV</h1>
          <p className="text-slate-500 mt-1">Detailed professional background and experience.</p>
        </div>
      </div>

      {/* Professional Summary */}
      <Section title="Professional Summary" icon={<Globe size={18} />}>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">About</h3>
            <p className="text-slate-600 whitespace-pre-line mt-1">{cv.summary || <span className="italic text-slate-400">Not provided</span>}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Years of Experience</h3>
              <p className="font-medium text-slate-900 mt-1">{cv.yearsOfExperience ?? 0} years</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Languages</h3>
              <p className="font-medium text-slate-900 mt-1">{cv.languages || 'Not specified'}</p>
            </div>
          </div>
          <div className="flex gap-4 pt-4 border-t border-slate-100">
            {cv.githubUrl && (
              <a href={cv.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                <Github size={16} /> GitHub Profile
              </a>
            )}
            {cv.portfolioUrl && (
              <a href={cv.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                <Globe size={16} /> Portfolio Website
              </a>
            )}
          </div>
        </div>
      </Section>

      {/* Work Experience */}
      <Section title="Work Experience" icon={<Briefcase size={18} />}>
        {!cv.workExperiences?.length ? (
          <p className="text-slate-500 text-sm italic">No work experience listed.</p>
        ) : (
          <div className="space-y-6">
            {cv.workExperiences.map((w, i) => (
              <div key={i} className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-200 last:before:hidden">
                <div className="absolute left-0 top-1.5 w-6 h-6 bg-indigo-50 border-2 border-indigo-200 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                </div>
                <h3 className="font-bold text-slate-900">{w.position}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-0.5 font-medium">
                  <span>{w.company}</span>
                  <span>•</span>
                  <span>
                    {w.startDate ? new Date(w.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric'}) : ''} 
                    {' - '} 
                    {w.current ? 'Present' : w.endDate ? new Date(w.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric'}) : ''}
                  </span>
                </div>
                {w.description && <p className="text-slate-600 text-sm mt-2 whitespace-pre-line bg-slate-50 p-3 rounded-lg">{w.description}</p>}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Education */}
      <Section title="Education" icon={<GraduationCap size={18} />}>
        {!cv.educations?.length ? (
          <p className="text-slate-500 text-sm italic">No education listed.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {cv.educations.map((e, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <h3 className="font-bold text-slate-900">{e.school}</h3>
                <p className="text-sm text-slate-700 font-medium mt-1">{e.degree} {e.major ? `in ${e.major}` : ''}</p>
                {e.graduationYear && <p className="text-sm text-slate-500 mt-1">Class of {e.graduationYear}</p>}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Certifications */}
      <Section title="Certifications" icon={<Award size={18} />}>
        {!cv.certifications?.length ? (
          <p className="text-slate-500 text-sm italic">No certifications listed.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {cv.certifications.map((c, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-4 flex gap-4 bg-slate-50/50">
                <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">{c.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{c.issuer}</p>
                  {c.year && <p className="text-xs font-medium text-slate-400 mt-1">Issued {c.year}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode; }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50 text-slate-900 font-semibold">
        <span className="text-indigo-600">{icon}</span>
        {title}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
