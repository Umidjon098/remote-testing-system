"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { CompetitionTimer } from "@/components/competitions";
import { submitCompetitionAction } from "../../actions";

interface Question {
  id: string;
  prompt: string;
  options: Array<{
    id: string;
    text: string;
  }>;
}

interface CompetitionRunnerProps {
  competitionId: string;
  questions: Question[];
  timeLimitSeconds: number;
}

export function CompetitionRunner({
  competitionId,
  questions,
  timeLimitSeconds,
}: CompetitionRunnerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [endTime] = useState(() => Date.now() + timeLimitSeconds * 1000);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswer = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const confirmed = confirm(
      "Testni yakunlamoqchimisiz? Bu amal qaytarilmaydi."
    );

    if (!confirmed) return;

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("competition_id", competitionId);
    formData.append("answers", JSON.stringify(answers));

    try {
      await submitCompetitionAction(formData);
    } catch (error) {
      console.error("Submit error:", error);
      alert("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
      setIsSubmitting(false);
    }
  };

  const handleTimeout = () => {
    alert("Vaqt tugadi! Test avtomatik yakunlanmoqda...");
    handleSubmit();
  };

  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canSubmit = answeredCount === questions.length;

  return (
    <div>
      {/* Header with Timer */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Musobaqa testi</h2>
          <p className="text-slate-600">
            Savol {currentQuestionIndex + 1} / {questions.length}
          </p>
        </div>
        <CompetitionTimer endTime={endTime} onTimeout={handleTimeout} />
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Jarayon</span>
          <span className="text-sm text-slate-600">
            {answeredCount} / {questions.length} javob berildi
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card variant="bordered" padding="lg" className="mb-6">
        <div className="mb-6">
          <div className="inline-block px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
            Savol {currentQuestionIndex + 1}
          </div>
          <h3 className="text-xl font-semibold text-slate-900">
            {currentQuestion.prompt}
          </h3>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-indigo-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500"
                        : "border-slate-300"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`font-medium ${
                      isSelected ? "text-indigo-900" : "text-slate-900"
                    }`}
                  >
                    {option.text}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() =>
            setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
          }
          variant="outline"
          size="lg"
          disabled={currentQuestionIndex === 0}
        >
          ← Oldingi
        </Button>

        <div className="flex gap-3">
          {!isLastQuestion ? (
            <Button onClick={handleNext} variant="primary" size="lg">
              Keyingi savol →
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              variant="primary"
              size="lg"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting
                ? "Yuborilmoqda..."
                : canSubmit
                ? "Testni yakunlash"
                : `${questions.length - answeredCount} ta savol qoldi`}
            </Button>
          )}
        </div>
      </div>

      {/* Warning for incomplete submission */}
      {isLastQuestion && !canSubmit && (
        <Card
          variant="bordered"
          padding="lg"
          className="mt-6 bg-amber-50 border-amber-200"
        >
          <p className="text-amber-800">
            <strong>Diqqat:</strong> Barcha savollarga javob bering. Hali{" "}
            {questions.length - answeredCount} ta savolga javob bermadingiz.
          </p>
        </Card>
      )}
    </div>
  );
}
