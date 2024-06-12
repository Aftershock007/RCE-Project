import PropTypes from "prop-types"
import { classnames } from "../../utils/general"
import { useEffect, useState } from "react"
import { ACTIONS } from "../../Actions"

export default function CustomInput({
  customInput,
  setCustomInput,
  roomId,
  socketRef
}) {
  const [val, setVal] = useState(customInput)
  const handleChange = (input) => {
    setVal(input)
    setCustomInput(input)
    socketRef.current.emit(ACTIONS.INPUT_CHANGE, {
      roomId,
      input
    })
  }

  useEffect(() => {
    if (socketRef.current) {
      const handleInputChange = ({ input }) => {
        setVal(input)
        setCustomInput(input)
      }
      socketRef.current.on(ACTIONS.INPUT_CHANGE, handleInputChange)
      return () => {
        socketRef.current.off(ACTIONS.INPUT_CHANGE, handleInputChange)
      }
    }
  }, [socketRef.current])

  return (
    <>
      <h1 className="font-bold text-xl">Input</h1>
      <textarea
        rows="10"
        value={val}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={`Custom input`}
        className={classnames(
          "focus:outline-none w-full border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white mt-2"
        )}
      />
    </>
  )
}

CustomInput.propTypes = {
  customInput: PropTypes.string,
  setCustomInput: PropTypes.func,
  roomId: PropTypes.string,
  socketRef: PropTypes.object
}
