import React from "react";
import AddEditMicrocredentialQuiz from "./AddEditMicrocredentialQuiz";

export default function AddEditQuizModal({ isOpen, onClose, quiz, onQuizSaved }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-800 my-6 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <AddEditMicrocredentialQuiz modalMode={true} modalQuiz={quiz} onModalClose={onClose} onModalSaved={onQuizSaved} />
        </div>
      </div>
    </div>
  );
}
