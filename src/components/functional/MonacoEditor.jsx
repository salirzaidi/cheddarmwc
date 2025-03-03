import React, { useState, useEffect, useRef } from "react";
import Editor from '@monaco-editor/react';

const MonacoEditor = ({initialValue,parentHook}) => {
    const editorRef = useRef(null);
    const handleEditorChange = (value) => {
        
        // Call the parent's callback with the current editor content
        if (parentHook) {
          
          parentHook(value);
        }
      };
    

  


  const handleEditorDidMount = (editor, monaco) => {
    // Define the Dracula theme
    editorRef.current = editor;
    monaco.editor.defineTheme('dracula', {
      base: 'vs-dark', // usually you'd want it to inherit a dark or light base
      inherit: true,
      rules: [
        { token: '', background: '282a36', foreground: 'f8f8f2' },
        { token: 'comment', foreground: '6272a4' },
        { token: 'string', foreground: 'f1fa8c' },
        { token: 'keyword', foreground: 'ff79c6' },
        { token: 'number', foreground: 'bd93f9' },
        { token: 'regexp', foreground: 'ffb86c' },
        { token: 'operator', foreground: 'ff79c6' },
        { token: 'namespace', foreground: 'f8f8f2' },
        // Add more rules as needed
      ],
      colors: {
        'editor.background': '#282a36',
        'editor.foreground': '#f8f8f2',
        'editorLineNumber.foreground': '#6272a4',
        'editor.selectionBackground': '#44475a',
      },
    });

    // Apply the Dracula theme
    monaco.editor.setTheme('dracula');
  };

  return (
    <div style={{
        borderRadius: '10px', // Add border-radius
        overflow: 'hidden', // Ensure that the editor content doesn't overflow rounded corners
        padding: '10px', // Add padding
        backgroundColor: '#282a36', // Match the background of the editor (optional)
      }}>
    <Editor
      height="60vh"
      defaultLanguage="python"
      value={initialValue}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={{
        accessibilitySupport: 'off', // Disable the accessibility keyboard icon
      
      }}
    />
    </div>
  );
};

export default MonacoEditor;