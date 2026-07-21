import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Save, Briefcase, GraduationCap, Award, Globe, Github } from 'lucide-react';
import { cvApi } from '@/api/cvApi';
import { WorkExperienceItem, EducationItem, CertificationItem } from '@/types/contract';
import Button from '@/components/ui/Button';

export default function ExpertCVPage() {
  const queryClient = useQueryClient();

  const { data: cv, isLoading } = useQuery({
    queryKey: ['my-cv'],
    queryFn: cvApi.getMyCV,
    retry: false,
    // 404 = CV not created yet — treat as null, not error
    throwOnError: false,
  });

  const [summary, setSummary] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>('');
  const [languages, setLanguages] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceItem[]>([]);
  const [educations, setEducations] = useState<EducationItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);

  // Sync state when CV data loads from server
  useEffect(() => {
    if (cv) {
      setSummary(cv.summary ?? '');
      setYearsOfExperience(cv.yearsOfExperience ?? '');
      setLanguages(cv.languages ?? '');
      setGithubUrl(cv.githubUrl ?? '');
      setPortfolioUrl(cv.portfolioUrl ?? '');
      setWorkExperiences(cv.workExperiences ?? []);
      setEducations(cv.educations ?? []);
      setCertifications(cv.certifications ?? []);
    }
  }, [cv]);

  const saveMutation = useMutation({
    mutationFn: () =>
      cvApi.upsertCV({
        summary,
        yearsOfExperience: yearsOfExperience === '' ? undefined : Number(yearsOfExperience),
        languages,
        githubUrl,
        portfolioUrl,
        workExperiences,
        educations,
        certifications,
      }),
    onSuccess: () => {
      toast.success('CV saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-cv'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to save CV'),
  });

  if (isLoading) return (
    <div className="p-8 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My CV</h1>
          <p className="text-slate-500 mt-1">
            AI will read this CV to evaluate your fit when you apply for jobs.
          </p>
        </div>
        <Button variant="primary" onClick={() => saveMutation.mutate()} isLoading={saveMutation.isPending}>
          <Save size={16} className="mr-2" /> Save CV
        </Button>
      </div>

      {/* Professional Summary */}
      <Section title="Professional Summary" icon={<Globe size={18} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-slate-700">About Me</label>
            <textarea
              rows={4}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="I am a specialist with 5+ years of experience in..."
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Years of Experience</label>
            <input
              type="number" min={0} max={50}
              value={yearsOfExperience}
              onChange={e => setYearsOfExperience(e.target.value ? Number(e.target.value) : '')}
              placeholder="5"
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Languages</label>
            <input
              type="text"
              value={languages}
              onChange={e => setLanguages(e.target.value)}
              placeholder="English (Native), Vietnamese (Fluent)"
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1"><Github size={14}/> GitHub URL</label>
            <input
              type="url"
              value={githubUrl}
              onChange={e => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Portfolio URL</label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={e => setPortfolioUrl(e.target.value)}
              placeholder="https://myportfolio.com"
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-indigo-500"
            />
          </div>
        </div>
      </Section>

      {/* Work Experience */}
      <Section title="Work Experience" icon={<Briefcase size={18} />}
        onAdd={() => setWorkExperiences([...workExperiences, { company: '', position: '', description: '', current: false }])}>
        {workExperiences.length === 0 && (
          <p className="text-slate-500 text-sm italic">No experience added yet. Click "+" to add.</p>
        )}
        {workExperiences.map((w, i) => (
          <div key={i} className="p-4 border border-slate-200 rounded-lg space-y-3 relative">
            <button type="button" onClick={() => setWorkExperiences(workExperiences.filter((_, j) => j !== i))}
              className="absolute top-3 right-3 text-red-400 hover:text-red-600">
              <Trash2 size={16} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Company" value={w.company} onChange={v => update(setWorkExperiences, i, 'company', v)} placeholder="Google Inc." />
              <Field label="Position" value={w.position} onChange={v => update(setWorkExperiences, i, 'position', v)} placeholder="Software Engineer" />
              <Field label="Start Date" type="date" value={w.startDate ?? ''} onChange={v => update(setWorkExperiences, i, 'startDate', v)} />
              <Field label="End Date" type="date" value={w.endDate ?? ''} onChange={v => update(setWorkExperiences, i, 'endDate', v)} disabled={w.current} />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={w.current} onChange={e => update(setWorkExperiences, i, 'current', e.target.checked)} />
              Currently working here
            </label>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea rows={2} value={w.description ?? ''} onChange={e => update(setWorkExperiences, i, 'description', e.target.value)}
                placeholder="Describe your responsibilities and achievements..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-indigo-500" />
            </div>
          </div>
        ))}
      </Section>

      {/* Education */}
      <Section title="Education" icon={<GraduationCap size={18} />}
        onAdd={() => setEducations([...educations, { school: '' }])}>
        {educations.length === 0 && (
          <p className="text-slate-500 text-sm italic">No education added yet. Click "+" to add.</p>
        )}
        {educations.map((e, i) => (
          <div key={i} className="p-4 border border-slate-200 rounded-lg space-y-3 relative">
            <button type="button" onClick={() => setEducations(educations.filter((_, j) => j !== i))}
              className="absolute top-3 right-3 text-red-400 hover:text-red-600">
              <Trash2 size={16} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="School / University" value={e.school} onChange={v => update(setEducations, i, 'school', v)} placeholder="MIT" />
              <Field label="Degree" value={e.degree ?? ''} onChange={v => update(setEducations, i, 'degree', v)} placeholder="Bachelor's" />
              <Field label="Major / Field of Study" value={e.major ?? ''} onChange={v => update(setEducations, i, 'major', v)} placeholder="Computer Science" />
              <Field label="Graduation Year" type="number" value={String(e.graduationYear ?? '')} onChange={v => update(setEducations, i, 'graduationYear', v ? Number(v) : undefined)} placeholder="2022" />
            </div>
          </div>
        ))}
      </Section>

      {/* Certifications */}
      <Section title="Certifications" icon={<Award size={18} />}
        onAdd={() => setCertifications([...certifications, { name: '' }])}>
        {certifications.length === 0 && (
          <p className="text-slate-500 text-sm italic">No certifications added yet. Click "+" to add.</p>
        )}
        {certifications.map((c, i) => (
          <div key={i} className="p-4 border border-slate-200 rounded-lg relative">
            <button type="button" onClick={() => setCertifications(certifications.filter((_, j) => j !== i))}
              className="absolute top-3 right-3 text-red-400 hover:text-red-600">
              <Trash2 size={16} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Certification Name" value={c.name} onChange={v => update(setCertifications, i, 'name', v)} placeholder="AWS Certified Developer" />
              <Field label="Issuing Organization" value={c.issuer ?? ''} onChange={v => update(setCertifications, i, 'issuer', v)} placeholder="Amazon Web Services" />
              <Field label="Year" type="number" value={String(c.year ?? '')} onChange={v => update(setCertifications, i, 'year', v ? Number(v) : undefined)} placeholder="2023" />
            </div>
          </div>
        ))}
      </Section>

      {/* Save bottom */}
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => saveMutation.mutate()} isLoading={saveMutation.isPending}>
          <Save size={16} className="mr-2" /> Save All Changes
        </Button>
      </div>
    </div>
  );
}

// ── Helper components ────────────────────────────────────────────

function Section({ title, icon, children, onAdd }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; onAdd?: () => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <span className="text-indigo-600">{icon}</span>
          {title}
        </div>
        {onAdd && (
          <button type="button" onClick={onAdd}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            <Plus size={16} /> Add
          </button>
        )}
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', disabled = false }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
      />
    </div>
  );
}

function update<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number, key: string, value: any) {
  setter(prev => prev.map((item, i) => i === index ? { ...item, [key]: value } : item));
}
