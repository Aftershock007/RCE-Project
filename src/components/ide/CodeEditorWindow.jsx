import { useState } from "react"
import PropTypes from "prop-types"
import Editor from "@monaco-editor/react"
import { ACTIONS } from "../../Actions"

export default function CodeEditorWindow({
  onChange,
  language = "cpp",
  code,
  theme,
  socketRef,
  roomId
}) {
  const [value, setValue] = useState(code || "")
  const handleChange = (value) => {
    setValue(value)
    onChange("code", value)
  }

  const handleEditorMount = (editor) => {
    editor.onDidChangeModelContent(() => {
      const code = editor.getValue()
      handleChange(code)
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        code
      })
    })
    socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
      handleChange(code)
    })
  }

  return (
    <div className="overlay rounded-md overflow-hidden w-full h-full">
      <Editor
        height="90vh"
        width={`100%`}
        language={language || "cpp"}
        value={value}
        theme={theme}
        onMount={handleEditorMount}
      />
    </div>
  )
}

CodeEditorWindow.propTypes = {
  onChange: PropTypes.func.isRequired,
  language: PropTypes.string,
  code: PropTypes.string,
  theme: PropTypes.string,
  roomId: PropTypes.string,
  socketRef: PropTypes.object
}
