import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { contractApi } from '@/api/contractApi';
import { jobApi } from '@/api/jobServiceApi';
import { SubmitProposalRequest } from '@/types/contract';
import Button from '@/components/ui/Button';

export default function ProposalFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [price, setPrice] = useState<number | ''>('');
  const [timelineDays, setTimelineDays] = useState<number | ''>('');
  const [coverLetter, setCoverLetter] = useState('');

  const { data: job, isLoading: isJobLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getById(Number(id)),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: (data: SubmitProposalRequest) => contractApi.submitProposal(Number(id), data),
    onSuccess: () => {
      toast.success('Proposal submitted successfully!');
      navigate('/jobs');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit proposal');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !timelineDays || coverLetter.length < 50) {
      toast.error('Please fill all fields correctly. Cover letter must be at least 50 characters.');
      return;
    }
    submitMutation.mutate({
      price: Number(price),
      timelineDays: Number(timelineDays),
      coverLetter,
    });
  };

  if (isJobLoading) return <div className="p-8 text-center text-slate-900">Loading job details...</div>;
  if (!job) return <div className="p-8 text-center text-slate-900">Job not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Submit Proposal</h1>
          <p className="text-slate-500">Propose your terms for this job.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-6 rounded-xl border border-slate-300 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Proposed Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                <input
                  type="number"
                  required
                  min="5"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-8 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g. 500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Timeline (Days)</label>
              <input
                type="number"
                required
                min="1"
                value={timelineDays}
                onChange={(e) => setTimelineDays(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="e.g. 14"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Cover Letter</label>
            <p className="text-xs text-slate-500">Introduce yourself and explain why you're a great fit.</p>
            <textarea
              required
              minLength={50}
              rows={8}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder="Hi, I am an expert in..."
            />
            <div className="text-xs text-right text-slate-500">
              {coverLetter.length} characters (min 50)
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitMutation.isPending}
              disabled={submitMutation.isPending || coverLetter.length < 50}
            >
              Submit Proposal
            </Button>
          </div>
        </form>
      </div>

      {/* Job Preview Section */}
      <div className="lg:col-span-1">
        <div className="bg-white border border-slate-200 p-6 rounded-xl border border-slate-300 sticky top-24">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Job Summary</h3>
          <h4 className="text-md text-primary-400 font-medium mb-2">{job.title}</h4>
          <p className="text-sm text-slate-600 line-clamp-4 mb-4">{job.description}</p>
          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex justify-between">
              <span>Budget:</span>
              <span className="font-medium text-slate-900">${job.budgetMin} - ${job.budgetMax}</span>
            </div>
            <div className="flex justify-between">
              <span>Client:</span>
              <span className="font-medium text-slate-900">{job.client.fullName || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
