import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/common/PageHeader';
import ResultCard from '../components/assessments/ResultCard';
import QuestionReview from '../components/assessments/QuestionReview';
import assessmentService from '../services/assessmentService';
import { useToast } from '../hooks/useToast';

const AssessmentResultPage = () => {
  const { id } = useParams(); // resultId
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [result, setResult] = useState(location.state?.resultData || null);
  const [loading, setLoading] = useState(!location.state?.resultData);
  const reviewRef = useRef(null);

  useEffect(() => {
    if (!result) {
      const fetchResult = async () => {
        try {
          setLoading(true);
          const res = await assessmentService.getAssessmentResultById(id);
          if (res?.data) {
            setResult(res.data);
          }
        } catch (error) {
          showToast(error.message || 'Failed to load assessment result', 'error');
        } finally {
          setLoading(false);
        }
      };

      fetchResult();
    }
  }, [id]);

  const handleRetake = () => {
    const assessmentId = result?.assessmentId?._id || result?.assessmentId;
    if (assessmentId) {
      navigate(`/assessments/take/${assessmentId}`);
    } else {
      navigate('/assessments');
    }
  };

  const handleScrollToReview = () => {
    if (reviewRef.current) {
      reviewRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Assessment Results">
        <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--slate-500, #64748b)' }}>
          <Sparkles size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
          <p>Retrieving your assessment scorecard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Assessment Scorecard">
      <PageHeader
        title="Assessment Scorecard & Competency Evaluation"
        description="Comprehensive evaluation breakdown, proficiency classification, and question explanations."
        badge={result?.passed ? 'Competency Verified 🏅' : 'Retest Recommended'}
      />

      {/* Main Result Card */}
      {result && (
        <ResultCard
          result={result}
          onRetake={handleRetake}
          onScrollToReview={handleScrollToReview}
        />
      )}

      {/* Detailed Question Review */}
      <div ref={reviewRef}>
        {result?.answers && <QuestionReview answers={result.answers} />}
      </div>
    </DashboardLayout>
  );
};

export default AssessmentResultPage;
