import PropTypes from "prop-types"
import { useCallback, useEffect, useState } from "react"
import CodeEditorWindow from "./CodeEditorWindow"
import axios from "axios"
import "react-toastify/dist/ReactToastify.css"
import { ToastContainer, toast } from "react-toastify"
import { classnames } from "../../utils/general"
import { languageOptions } from "../../constants/languageOptions"
import { defineTheme } from "../../lib/defineTheme"
import useKeyPress from "../../hooks/useKeyPress"
import OutputWindow from "./OutputWindow"
import CustomInput from "./CustomInput"
import OutputDetails from "./OutputDetails"
import ThemeDropdown from "./ThemeDropdown"
import LanguagesDropdown from "./LanguagesDropdown"
import { useDebouncedCallback } from "use-debounce"

export default function Landing({ roomId, socketRef }) {
  const [code, setCode] = useState("")
  const [customInput, setCustomInput] = useState("")
  const [outputDetails, setOutputDetails] = useState(null)
  const [processing, setProcessing] = useState(null)
  const [theme, setTheme] = useState({})
  const [language, setLanguage] = useState(languageOptions[0])

  const enterPress = useKeyPress("Enter")
  const ctrlPress = useKeyPress("Control")

  const onSelectChange = (sl) => {
    console.log("selected Option...", sl)
    setLanguage(sl)
  }

  const onChange = (action, data) => {
    if (action === "code") {
      setCode(data)
    } else {
      console.warn("case not handled!", action, data)
    }
  }

  const checkStatus = useCallback(async (token) => {
    const options = {
      method: "GET",
      url: import.meta.env.VITE_REACT_APP_RAPID_API_URL + "/" + token,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Host": import.meta.env.VITE_REACT_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": import.meta.env.VITE_REACT_APP_RAPID_API_KEY
      }
    }
    try {
      let response = await axios.request(options)
      let statusId = response.data.status?.id

      if (statusId === 1 || statusId === 2) {
        setTimeout(() => {
          checkStatus(token)
        }, 2000)
        return
      } else {
        setProcessing(false)
        setOutputDetails(response.data)
        showSuccessToast(`Compiled Successfully!`)
        return
      }
    } catch (err) {
      console.log("err", err)
      setProcessing(false)
      showErrorToast()
    }
  }, [])

  const handleCompile = useCallback(() => {
    setProcessing(true)
    const formData = {
      language_id: language.id,
      source_code: btoa(code),
      stdin: btoa(customInput)
    }
    const options = {
      method: "POST",
      url: import.meta.env.VITE_REACT_APP_RAPID_API_URL,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": import.meta.env.VITE_REACT_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": import.meta.env.VITE_REACT_APP_RAPID_API_KEY
      },
      data: formData
    }

    axios
      .request(options)
      .then(function (response) {
        const token = response.data.token
        checkStatus(token)
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err
        let status = err.response.status
        console.log("status", status)
        if (status === 429) {
          console.log("too many requests", status)
          showErrorToast(`Quota of 100 requests exceeded for the Day!`, 1000)
        }
        setProcessing(false)
        console.log("catch block...", error)
      })
  }, [checkStatus, code, customInput, language.id])

  const debouncedHandleCompile = useDebouncedCallback(handleCompile, 500)

  useEffect(() => {
    if (enterPress && ctrlPress) {
      console.log("enterPress", enterPress)
      console.log("ctrlPress", ctrlPress)
      handleCompile()
    }
  }, [ctrlPress, enterPress, handleCompile])

  function handleThemeChange(th) {
    const theme = th
    console.log("theme...", theme)

    if (["light", "vs-dark"].includes(theme.value)) {
      setTheme(theme)
    } else {
      defineTheme(theme.value).then(() => setTheme(theme))
    }
  }

  useEffect(() => {
    defineTheme("monokai").then(() =>
      setTheme({ value: "monokai", label: "monokai" })
    )
  }, [])

  const showSuccessToast = (msg) => {
    toast.success(msg || `Compiled Successfully!`, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined
    })
  }
  const showErrorToast = (msg, timer) => {
    toast.error(msg || `Something went wrong! Please try again.`, {
      position: "top-right",
      autoClose: timer || 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined
    })
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="flex flex-row">
        <div className="px-4 py-2">
          <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
        </div>
        <div className="px-4 py-2">
          <LanguagesDropdown onSelectChange={onSelectChange} />
        </div>
      </div>
      <div className="flex flex-row space-x-4 items-start px-4 pt-4">
        <div className="flex flex-col w-full h-full justify-start items-end">
          <CodeEditorWindow
            code={code}
            onChange={onChange}
            language={language?.value}
            theme={theme.value}
            roomId={roomId}
            socketRef={socketRef}
          />
        </div>
        <div className="right-container flex flex-shrink-0 w-[30%] flex-col">
          <div className="flex flex-col items-start mb-10">
            <CustomInput
              customInput={customInput}
              setCustomInput={setCustomInput}
              roomId={roomId}
              socketRef={socketRef}
            />
          </div>
          <OutputWindow outputDetails={outputDetails} />
          {/* <button
            onClick={handleCompile}
            disabled={!code}
            className={classnames(
              "mt-4 border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0",
              !code ? "opacity-50" : ""
            )}
          >
            {processing ? "Processing..." : "Compile and Execute"}
          </button> */}
          <button
            onClick={debouncedHandleCompile}
            disabled={!code}
            className={classnames(
              "mt-4 border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0",
              !code ? "opacity-50" : ""
            )}
          >
            {processing ? "Processing..." : "Compile and Execute"}
          </button>
          {outputDetails && <OutputDetails outputDetails={outputDetails} />}
        </div>
      </div>
    </>
  )
}

Landing.propTypes = {
  roomId: PropTypes.string.isRequired,
  socketRef: PropTypes.object
}
