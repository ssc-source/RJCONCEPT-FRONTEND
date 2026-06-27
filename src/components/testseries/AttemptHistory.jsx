"use client";
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';

export default function AttemptHistory({ seriesId }) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!seriesId) return;

    const fetchAttempts = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/test-attempts/series/${seriesId}/history`);
        setAttempts(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load attempt history');
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [seriesId]);

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Attempt History</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Attempt History</h3>
        <div className="text-center py-8 text-slate-500">
          {error}
        </div>
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Attempt History</h3>
        <div className="text-center py-8 text-slate-500">
          No attempts found for this series. Start taking tests to see your progress here.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Attempt History</h3>
      <div className="space-y-3">
        {attempts.map((attempt) => (
          <div key={attempt.id} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-slate-900">{attempt.test?.title || 'Test'}</h4>
                <p className="text-sm text-slate-500">
                  Submitted: {format(new Date(attempt.submittedAt), 'MMM dd, yyyy hh:mm a')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-900">{attempt.score}/{attempt.totalQuestions}</div>
                <div className={`text-sm font-medium ${
                  attempt.percentage >= 70 ? 'text-green-600' :
                  attempt.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {attempt.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="mt-2 flex justify-between text-sm text-slate-600">
              <span>Correct: {attempt.correctAnswers}</span>
              <span>Incorrect: {attempt.incorrectAnswers}</span>
              <span>Rank: {attempt.rank || 'N/A'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}