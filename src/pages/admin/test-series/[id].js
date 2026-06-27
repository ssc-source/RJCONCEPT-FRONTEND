import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../../services/api';
import { useCourseStore } from '../../../stores/courseStore';
import { useTestSeriesStore } from '../../../stores/testSeriesStore';
import { fileToBase64 } from '../../../utils/file';

const MAX_QUESTIONS_PER_TEST = 180;

const emptyTest = {
  title: '',
  description: '',
  duration: 60,
  totalMarks: 0,
  passingMarks: 0,
  instructions: '',
};

const emptyQuestion = {
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  marks: 1,
  explanation: '',
};

export default function TestSeriesDetailPage() {
  const adminMeta = { meta: { scope: 'admin' } };
  const router = useRouter();
  const { id } = router.query;
  const { courses, fetchCourses } = useCourseStore();
  const { current, fetchTestSeriesById, updateTestSeries } = useTestSeriesStore();
  const [seriesForm, setSeriesForm] = useState(null);
  const [testsDraft, setTestsDraft] = useState([]);
  const [thumbnailBase64, setThumbnailBase64] = useState('');
  const [newTest, setNewTest] = useState(emptyTest);
  const [questionDrafts, setQuestionDrafts] = useState({});

  const loadSeries = async () => {
    if (!id) return;
    const data = await fetchTestSeriesById(id);
    setSeriesForm({
      title: data.title || '',
      description: data.description || '',
      courseId: data.courseId || '',
      price: data.price || 0,
      isActive: data.isActive,
    });
    setTestsDraft((data.tests || []).map((test) => ({
      ...test,
      questions: test.questions || [],
    })));
  };

  useEffect(() => {
    fetchCourses().catch(() => {});
  }, [fetchCourses]);

  useEffect(() => {
    loadSeries().catch(() => {});
  }, [id]);

  const updateDraftTest = (testId, updates) => {
    setTestsDraft((currentDrafts) => currentDrafts.map((test) => (test.id === testId ? { ...test, ...updates } : test)));
  };

  const updateDraftQuestion = (testId, questionId, updates) => {
    setTestsDraft((currentDrafts) => currentDrafts.map((test) => (
      test.id === testId
        ? {
            ...test,
            questions: test.questions.map((question) => (question.id === questionId ? { ...question, ...updates } : question)),
          }
        : test
    )));
  };

  if (!current || !seriesForm) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">Loading test series...</div>;
  }

  const saveSeries = async () => {
    try {
      await updateTestSeries(current.id, { ...seriesForm, price: Number(seriesForm.price || 0), thumbnailBase64 });
      await loadSeries();
      alert('Series updated');
    } catch (error) {
      alert(error.message || 'Unable to update series');
    }
  };

  const createTest = async () => {
    try {
      await api.post('/tests', {
        ...newTest,
        testSeriesId: current.id,
        courseId: seriesForm.courseId || null,
        duration: Number(newTest.duration || 0),
        totalMarks: Number(newTest.totalMarks || 0),
        passingMarks: Number(newTest.passingMarks || 0),
      }, adminMeta);
      setNewTest(emptyTest);
      await loadSeries();
    } catch (error) {
      alert(error.message || 'Unable to create test');
    }
  };

  const saveTest = async (test) => {
    try {
      await api.put(`/tests/${test.id}`, {
        title: test.title,
        description: test.description,
        duration: Number(test.duration || 0),
        totalMarks: Number(test.totalMarks || 0),
        passingMarks: Number(test.passingMarks || 0),
        instructions: test.instructions,
      }, adminMeta);
      await loadSeries();
    } catch (error) {
      alert(error.message || 'Unable to update test');
    }
  };

  const removeTest = async (testId) => {
    try {
      await api.delete(`/tests/${testId}`, adminMeta);
      await loadSeries();
    } catch (error) {
      alert(error.message || 'Unable to delete test');
    }
  };

  const saveQuestion = async (testId, question) => {
    try {
      const payload = {
        questionText: question.questionText,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD,
        correctAnswer: question.correctAnswer,
        marks: Number(question.marks || 1),
        explanation: question.explanation || '',
      };

      if (question.id) {
        await api.put(`/questions/${question.id}`, payload, adminMeta);
      } else {
        await api.post('/questions', {
          ...payload,
          testId,
        }, adminMeta);
      }
      setQuestionDrafts((state) => ({ ...state, [testId]: emptyQuestion }));
      await loadSeries();
    } catch (error) {
      alert(error.message || 'Unable to save question');
    }
  };

  const removeQuestion = async (questionId) => {
    try {
      await api.delete(`/questions/${questionId}`, adminMeta);
      await loadSeries();
    } catch (error) {
      alert(error.message || 'Unable to delete question');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">{current.title}</h1>
            <p className="mt-1 text-sm text-slate-500">Edit the commercial settings and nested assessment structure.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => router.push('/admin/test-series')} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              Back to List
            </button>
            <button type="button" onClick={() => router.push(`/admin/test-series/${id}/rankings`)} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
              Series Rankings
            </button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input className="rounded-xl border border-slate-200 px-4 py-3" value={seriesForm.title} onChange={(e) => setSeriesForm({ ...seriesForm, title: e.target.value })} />
          <select className="rounded-xl border border-slate-200 px-4 py-3" value={seriesForm.courseId} onChange={(e) => setSeriesForm({ ...seriesForm, courseId: e.target.value })}>
            <option value="">Standalone series</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
          <textarea className="rounded-xl border border-slate-200 px-4 py-3 md:col-span-2" rows="3" value={seriesForm.description} onChange={(e) => setSeriesForm({ ...seriesForm, description: e.target.value })} />
          <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="0" value={seriesForm.price} onChange={(e) => setSeriesForm({ ...seriesForm, price: e.target.value })} />
          <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={seriesForm.isActive} onChange={(e) => setSeriesForm({ ...seriesForm, isActive: e.target.checked })} />
            Active
          </label>
          <input className="md:col-span-2" type="file" accept="image/png,image/jpeg,image/webp" onChange={async (e) => setThumbnailBase64(await fileToBase64(e.target.files?.[0]))} />
        </div>
        <button type="button" className="mt-4 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white" onClick={saveSeries}>
          Save Series Settings
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Add Test</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Test title" value={newTest.title} onChange={(e) => setNewTest({ ...newTest, title: e.target.value })} />
          <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="1" placeholder="Duration" value={newTest.duration} onChange={(e) => setNewTest({ ...newTest, duration: e.target.value })} />
          <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="0" placeholder="Total marks" value={newTest.totalMarks} onChange={(e) => setNewTest({ ...newTest, totalMarks: e.target.value })} />
          <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="0" placeholder="Passing marks" value={newTest.passingMarks} onChange={(e) => setNewTest({ ...newTest, passingMarks: e.target.value })} />
          <textarea className="rounded-xl border border-slate-200 px-4 py-3 md:col-span-2" rows="2" placeholder="Description" value={newTest.description} onChange={(e) => setNewTest({ ...newTest, description: e.target.value })} />
        </div>
        <button type="button" className="mt-4 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white" onClick={createTest}>
          Add Test to Series
        </button>
      </div>

      <div className="space-y-4">
        {testsDraft.map((test) => (
          <div key={test.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{test.title}</h2>
                <p className="text-sm text-slate-500">{test.questions?.length || 0} questions</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold" onClick={() => saveTest(test)}>
                  Save Test
                </button>
                <button type="button" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700" onClick={() => removeTest(test.id)}>
                  Delete Test
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input className="rounded-xl border border-slate-200 px-4 py-3" value={test.title} onChange={(e) => updateDraftTest(test.id, { title: e.target.value })} />
              <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="1" value={test.duration} onChange={(e) => updateDraftTest(test.id, { duration: e.target.value })} />
              <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="0" value={test.totalMarks} onChange={(e) => updateDraftTest(test.id, { totalMarks: e.target.value })} />
              <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="0" value={test.passingMarks} onChange={(e) => updateDraftTest(test.id, { passingMarks: e.target.value })} />
              <textarea className="rounded-xl border border-slate-200 px-4 py-3 md:col-span-2" rows="2" value={test.description || ''} onChange={(e) => updateDraftTest(test.id, { description: e.target.value })} />
            </div>

            <div className="mt-6 space-y-4">
              {test.questions?.map((question) => (
                <div key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="grid gap-4">
                    <textarea className="rounded-xl border border-slate-200 px-4 py-3" rows="2" value={question.questionText} onChange={(e) => updateDraftQuestion(test.id, question.id, { questionText: e.target.value })} />
                    <div className="grid gap-4 md:grid-cols-2">
                      <input className="rounded-xl border border-slate-200 px-4 py-3" value={question.optionA} onChange={(e) => updateDraftQuestion(test.id, question.id, { optionA: e.target.value })} />
                      <input className="rounded-xl border border-slate-200 px-4 py-3" value={question.optionB} onChange={(e) => updateDraftQuestion(test.id, question.id, { optionB: e.target.value })} />
                      <input className="rounded-xl border border-slate-200 px-4 py-3" value={question.optionC} onChange={(e) => updateDraftQuestion(test.id, question.id, { optionC: e.target.value })} />
                      <input className="rounded-xl border border-slate-200 px-4 py-3" value={question.optionD} onChange={(e) => updateDraftQuestion(test.id, question.id, { optionD: e.target.value })} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <select className="rounded-xl border border-slate-200 px-4 py-3" value={question.correctAnswer} onChange={(e) => updateDraftQuestion(test.id, question.id, { correctAnswer: e.target.value })}>
                        <option value="A">Correct: A</option>
                        <option value="B">Correct: B</option>
                        <option value="C">Correct: C</option>
                        <option value="D">Correct: D</option>
                      </select>
                      <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="1" value={question.marks} onChange={(e) => updateDraftQuestion(test.id, question.id, { marks: e.target.value })} />
                    </div>
                    <textarea className="rounded-xl border border-slate-200 px-4 py-3" rows="2" value={question.explanation || ''} onChange={(e) => updateDraftQuestion(test.id, question.id, { explanation: e.target.value })} />
                    <div className="flex justify-end gap-2">
                      <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold" onClick={() => saveQuestion(test.id, question)}>
                        Save Question
                      </button>
                      <button type="button" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700" onClick={() => removeQuestion(question.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border border-dashed border-slate-300 p-5">
                <h3 className="font-bold text-slate-900">Add Question</h3>
                <div className="mt-4 grid gap-4">
                  <textarea className="rounded-xl border border-slate-200 px-4 py-3" rows="2" placeholder="Question text" value={questionDrafts[test.id]?.questionText || ''} onChange={(e) => setQuestionDrafts((state) => ({ ...state, [test.id]: { ...(state[test.id] || emptyQuestion), questionText: e.target.value } }))} />
                  <div className="grid gap-4 md:grid-cols-2">
                    {['optionA', 'optionB', 'optionC', 'optionD'].map((key) => (
                      <input key={key} className="rounded-xl border border-slate-200 px-4 py-3" placeholder={key.replace('option', 'Option ')} value={questionDrafts[test.id]?.[key] || ''} onChange={(e) => setQuestionDrafts((state) => ({ ...state, [test.id]: { ...(state[test.id] || emptyQuestion), [key]: e.target.value } }))} />
                    ))}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <select className="rounded-xl border border-slate-200 px-4 py-3" value={questionDrafts[test.id]?.correctAnswer || 'A'} onChange={(e) => setQuestionDrafts((state) => ({ ...state, [test.id]: { ...(state[test.id] || emptyQuestion), correctAnswer: e.target.value } }))}>
                      <option value="A">Correct: A</option>
                      <option value="B">Correct: B</option>
                      <option value="C">Correct: C</option>
                      <option value="D">Correct: D</option>
                    </select>
                    <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="1" placeholder="Marks" value={questionDrafts[test.id]?.marks || 1} onChange={(e) => setQuestionDrafts((state) => ({ ...state, [test.id]: { ...(state[test.id] || emptyQuestion), marks: e.target.value } }))} />
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-4 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={(test.questions?.length || 0) >= MAX_QUESTIONS_PER_TEST}
                  onClick={() => saveQuestion(test.id, questionDrafts[test.id] || emptyQuestion)}
                >
                  Add Question
                </button>
                <p className="mt-2 text-xs text-slate-500">{test.questions?.length || 0}/{MAX_QUESTIONS_PER_TEST} questions</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
