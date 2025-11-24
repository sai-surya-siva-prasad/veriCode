import React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, readOnly = false }) => {
  const highlight = (code: string) => {
    return Prism.highlight(
      code,
      Prism.languages.verilog || Prism.languages.clike,
      'verilog'
    );
  };

  return (
    <div className="h-full w-full bg-[#1e1e1e] text-gray-200 font-mono text-sm overflow-auto relative">
      <Editor
        value={code}
        onValueChange={onChange}
        highlight={highlight}
        padding={20}
        readOnly={readOnly}
        className="editor-font min-h-full"
        style={{
          fontFamily: '"Fira Code", "Fira Mono", monospace',
          fontSize: 14,
          backgroundColor: '#1e1e1e',
        }}
        textareaClassName="focus:outline-none"
      />
    </div>
  );
};

export default CodeEditor;
