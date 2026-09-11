import React, { useRef, useEffect, useState } from "react";

/**
 * RichTextEditor Component
 * Modern, rich WYSIWYG editor matching CKEditor / Quill toolbar aesthetics.
 * Outputs semantic HTML string.
 */
export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write detailed description here...",
  minHeight = "220px",
}) {
  const editorRef = useRef(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState(value);

  // Sync incoming value with editor content
  useEffect(() => {
    if (editorRef.current && !isSourceMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, isSourceMode]);

  const handleContentChange = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setSourceCode(html);
      if (onChange) onChange(html);
    }
  };

  const executeCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    handleContentChange();
    if (editorRef.current) editorRef.current.focus();
  };

  const handleLinkPrompt = () => {
    const url = prompt("Enter link URL:", "https://");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  const handleImagePrompt = () => {
    const url = prompt("Enter image URL:", "https://");
    if (url) {
      executeCommand("insertImage", url);
    }
  };

  const handleSourceToggle = () => {
    if (isSourceMode) {
      // Switching from HTML source to visual editor
      if (editorRef.current) {
        editorRef.current.innerHTML = sourceCode;
      }
      if (onChange) onChange(sourceCode);
      setIsSourceMode(false);
    } else {
      // Switching to HTML source mode
      setSourceCode(editorRef.current ? editorRef.current.innerHTML : "");
      setIsSourceMode(true);
    }
  };

  const handleSourceCodeChange = (e) => {
    const newHtml = e.target.value;
    setSourceCode(newHtml);
    if (onChange) onChange(newHtml);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white transition-all focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900">
      {/* Top Toolbar matching screenshot 2 */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50/80 p-1.5 text-gray-700 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-300">
        {/* Font Family */}
        <select
          onChange={(e) => executeCommand("fontName", e.target.value)}
          defaultValue="Inter, sans-serif"
          className="h-7 rounded border border-gray-200 bg-white px-2 text-[11px] font-medium text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          title="Font Family"
        >
          <option value="Inter, sans-serif">Sans Serif</option>
          <option value="Georgia, serif">Serif</option>
          <option value="Courier New, monospace">Monospace</option>
        </select>

        {/* Heading / Block Format */}
        <select
          onChange={(e) => executeCommand("formatBlock", e.target.value)}
          defaultValue="p"
          className="h-7 rounded border border-gray-200 bg-white px-2 text-[11px] font-medium text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          title="Text Style"
        >
          <option value="p">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="blockquote">Quote</option>
        </select>

        <span className="mx-0.5 h-4 w-px bg-gray-300 dark:bg-gray-700" />

        {/* Bold */}
        <button
          type="button"
          onClick={() => executeCommand("bold")}
          className="size-7 rounded font-bold hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700"
          title="Bold (Ctrl+B)"
        >
          B
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => executeCommand("italic")}
          className="size-7 rounded italic hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700"
          title="Italic (Ctrl+I)"
        >
          I
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => executeCommand("underline")}
          className="size-7 rounded underline hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700"
          title="Underline (Ctrl+U)"
        >
          U
        </button>

        {/* Strikethrough */}
        <button
          type="button"
          onClick={() => executeCommand("strikeThrough")}
          className="size-7 rounded line-through hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700"
          title="Strikethrough"
        >
          S
        </button>

        <span className="mx-0.5 h-4 w-px bg-gray-300 dark:bg-gray-700" />

        {/* Link */}
        <button
          type="button"
          onClick={handleLinkPrompt}
          className="size-7 rounded hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700"
          title="Insert Link"
        >
          🔗
        </button>

        {/* Image */}
        <button
          type="button"
          onClick={handleImagePrompt}
          className="size-7 rounded hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700"
          title="Insert Image"
        >
          🖼️
        </button>

        <span className="mx-0.5 h-4 w-px bg-gray-300 dark:bg-gray-700" />

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => executeCommand("insertUnorderedList")}
          className="size-7 rounded text-xs hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700"
          title="Bullet List"
        >
          •≡
        </button>

        {/* Numbered List */}
        <button
          type="button"
          onClick={() => executeCommand("insertOrderedList")}
          className="size-7 rounded text-xs hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700"
          title="Numbered List"
        >
          1.≡
        </button>

        {/* Subscript */}
        <button
          type="button"
          onClick={() => executeCommand("subscript")}
          className="size-7 rounded text-[10px] hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700"
          title="Subscript"
        >
          X₂
        </button>

        {/* Superscript */}
        <button
          type="button"
          onClick={() => executeCommand("superscript")}
          className="size-7 rounded text-[10px] hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700"
          title="Superscript"
        >
          X²
        </button>

        <span className="mx-0.5 h-4 w-px bg-gray-300 dark:bg-gray-700" />

        {/* Align Left */}
        <button
          type="button"
          onClick={() => executeCommand("justifyLeft")}
          className="size-7 rounded text-xs hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700"
          title="Align Left"
        >
          ⇠
        </button>

        {/* Align Center */}
        <button
          type="button"
          onClick={() => executeCommand("justifyCenter")}
          className="size-7 rounded text-xs hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700"
          title="Align Center"
        >
          ≡
        </button>

        {/* Align Right */}
        <button
          type="button"
          onClick={() => executeCommand("justifyRight")}
          className="size-7 rounded text-xs hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700"
          title="Align Right"
        >
          ⇢
        </button>

        <span className="mx-0.5 h-4 w-px bg-gray-300 dark:bg-gray-700" />

        {/* Clear formatting */}
        <button
          type="button"
          onClick={() => executeCommand("removeFormat")}
          className="size-7 rounded text-xs hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700"
          title="Clear Formatting"
        >
          Tx
        </button>

        {/* Toggle HTML Source Code */}
        <button
          type="button"
          onClick={handleSourceToggle}
          className={`ml-auto rounded px-2 py-1 text-[11px] font-semibold transition ${
            isSourceMode
              ? "bg-brand-500 text-white"
              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}
          title="Toggle HTML Source"
        >
          {isSourceMode ? "Visual Editor" : "HTML Source"}
        </button>
      </div>

      {/* Editor Content Box */}
      {isSourceMode ? (
        <textarea
          value={sourceCode}
          onChange={handleSourceCodeChange}
          style={{ minHeight }}
          className="w-full bg-gray-900 p-4 font-mono text-xs text-emerald-400 focus:outline-none"
          placeholder="<p>Enter HTML code here...</p>"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          style={{ minHeight }}
          data-placeholder={placeholder}
          className="rich-editor-content p-4 text-sm leading-relaxed text-gray-800 focus:outline-none dark:text-gray-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-brand-500 [&_blockquote]:pl-3 [&_blockquote]:italic [&_a]:text-blue-500 [&_a]:underline"
        />
      )}
    </div>
  );
}
