import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useCourseStore } from '../../../stores/courseStore';
import { useTestSeriesStore } from '../../../stores/testSeriesStore';
import { fileToBase64 } from '../../../utils/file';

const MAX_QUESTIONS_PER_TEST = 180;

const createQuestion = () => ({
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  marks: 1,
  explanation: '',
});

const createTest = () => ({
  title: '',
  description: '',
  duration: 60,
  totalMarks: 0,
  passingMarks: 0,
  instructions: '',
  questions: [createQuestion()],
});

export default function CreateTestSeriesPage() {
  const router = useRouter();
  const { courses, fetchCourses } = useCourseStore();
  const { createTestSeries } = useTestSeriesStore();
  const [thumbnailBase64, setThumbnailBase64] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    courseId: '',
    price: 0,
    isActive: true,
    tests: [createTest()],
  });

  useEffect(() => {
    fetchCourses().catch(() => {});
  }, [fetchCourses]);

  const updateTest = (index, updates) => {
    setForm((current) => ({
      ...current,
      tests: current.tests.map((test, testIndex) => (testIndex === index ? { ...test, ...updates } : test)),
    }));
  };

  const updateQuestion = (testIndex, questionIndex, updates) => {
    setForm((current) => ({
      ...current,
      tests: current.tests.map((test, currentTestIndex) => (
        currentTestIndex === testIndex
          ? {
              ...test,
              questions: test.questions.map((question, currentQuestionIndex) => (
                currentQuestionIndex === questionIndex ? { ...question, ...updates } : question
              )),
            }
          : test
      )),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      const tooLargeTest = form.tests.find((test) => test.questions.length > MAX_QUESTIONS_PER_TEST);
      if (tooLargeTest) {
        throw new Error(`A test can contain at most ${MAX_QUESTIONS_PER_TEST} questions.`);
      }

      const payload = {
        ...form,
        price: Number(form.price || 0),
        thumbnailBase64,
        tests: form.tests.map((test) => ({
          ...test,
          duration: Number(test.duration || 0),
          totalMarks: Number(test.totalMarks || 0),
          passingMarks: Number(test.passingMarks || 0),
          questions: test.questions.map((question, index) => ({
            ...question,
            marks: Number(question.marks || 1),
            orderIndex: index,
          })),
        })),
      };
      const created = await createTestSeries(payload);
      router.push(`/admin/test-series/${created.id}`);
    } catch (error) {
      alert(error.message || 'Unable to create test series');
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-extrabold text-slate-900">Create Revenue-Ready Test Series</h1>
        <p className="mt-2 text-sm text-slate-500">Build the full structure in one flow: series, tests, and MCQ bank.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Series title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <select className="rounded-xl border border-slate-200 px-4 py-3" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
            <option value="">Standalone series</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
          <textarea className="rounded-xl border border-slate-200 px-4 py-3 md:col-span-2" rows="4" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="0" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Visible to users
          </label>
          <input className="md:col-span-2" type="file" accept="image/png,image/jpeg,image/webp" onChange={async (e) => setThumbnailBase64(await fileToBase64(e.target.files?.[0]))} />
        </div>
      </div>

      <div className="space-y-4">
        {form.tests.map((test, testIndex) => (
          <div key={`test-${testIndex}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Test {testIndex + 1}</h2>
              {form.tests.length > 1 && (
                <button type="button" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700" onClick={() => setForm((current) => ({ ...current, tests: current.tests.filter((_, index) => index !== testIndex) }))}>
                  Remove Test
                </button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Test title" value={test.title} onChange={(e) => updateTest(testIndex, { title: e.target.value })} required />
              <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="1" placeholder="Duration (minutes)" value={test.duration} onChange={(e) => updateTest(testIndex, { duration: e.target.value })} required />
              <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="0" placeholder="Total marks" value={test.totalMarks} onChange={(e) => updateTest(testIndex, { totalMarks: e.target.value })} />
              <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="0" placeholder="Passing marks" value={test.passingMarks} onChange={(e) => updateTest(testIndex, { passingMarks: e.target.value })} />
              <textarea className="rounded-xl border border-slate-200 px-4 py-3 md:col-span-2" rows="3" placeholder="Description" value={test.description} onChange={(e) => updateTest(testIndex, { description: e.target.value })} />
              <textarea className="rounded-xl border border-slate-200 px-4 py-3 md:col-span-2" rows="3" placeholder="Instructions" value={test.instructions} onChange={(e) => updateTest(testIndex, { instructions: e.target.value })} />
            </div>

            <div className="mt-6 space-y-4">
              {test.questions.map((question, questionIndex) => (
                <div key={`question-${questionIndex}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Question {questionIndex + 1}</h3>
                    {test.questions.length > 1 && (
                      <button type="button" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700" onClick={() => updateTest(testIndex, { questions: test.questions.filter((_, index) => index !== questionIndex) })}>
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid gap-4">
                    <textarea className="rounded-xl border border-slate-200 px-4 py-3" rows="3" placeholder="Question text" value={question.questionText} onChange={(e) => updateQuestion(testIndex, questionIndex, { questionText: e.target.value })} required />
                    <div className="grid gap-4 md:grid-cols-2">
                      <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Option A" value={question.optionA} onChange={(e) => updateQuestion(testIndex, questionIndex, { optionA: e.target.value })} required />
                      <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Option B" value={question.optionB} onChange={(e) => updateQuestion(testIndex, questionIndex, { optionB: e.target.value })} required />
                      <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Option C" value={question.optionC} onChange={(e) => updateQuestion(testIndex, questionIndex, { optionC: e.target.value })} required />
                      <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Option D" value={question.optionD} onChange={(e) => updateQuestion(testIndex, questionIndex, { optionD: e.target.value })} required />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <select className="rounded-xl border border-slate-200 px-4 py-3" value={question.correctAnswer} onChange={(e) => updateQuestion(testIndex, questionIndex, { correctAnswer: e.target.value })}>
                        <option value="A">Correct: A</option>
                        <option value="B">Correct: B</option>
                        <option value="C">Correct: C</option>
                        <option value="D">Correct: D</option>
                      </select>
                      <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="1" placeholder="Marks" value={question.marks} onChange={(e) => updateQuestion(testIndex, questionIndex, { marks: e.target.value })} />
                    </div>
                    <textarea className="rounded-xl border border-slate-200 px-4 py-3" rows="2" placeholder="Explanation (optional)" value={question.explanation} onChange={(e) => updateQuestion(testIndex, questionIndex, { explanation: e.target.value })} />
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="rounded-xl border border-dashed border-blue-300 px-4 py-3 text-sm font-semibold text-blue-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                disabled={test.questions.length >= MAX_QUESTIONS_PER_TEST}
                onClick={() => updateTest(testIndex, { questions: [...test.questions, createQuestion()] })}
              >
                Add Question
              </button>
              <p className="text-xs text-slate-500">{test.questions.length}/{MAX_QUESTIONS_PER_TEST} questions</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700" onClick={() => setForm((current) => ({ ...current, tests: [...current.tests, createTest()] }))}>
          Add Another Test
        </button>
        <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">
          Save Test Series
        </button>
      </div>
    </form>
  );
}
